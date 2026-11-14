import express, { type Request, type Response } from "express";
import { config } from "./config.js";
import { verifyBodySignature, signBody } from "./security/hmac.js";
import { gatekeeperTaskSchema, preflightSchema } from "./types.js";
import { JsonSeenProofStore } from "./security/seen-proofs.js";
import { handleTask } from "./agent.js";
const app = express();
const seen = new JsonSeenProofStore(config.SEEN_PROOFS_FILE);
app.use(express.raw({ type: "application/json", limit: "256kb" }));
function sendSigned(res: Response, status: number, payload: unknown): void {
  const raw = Buffer.from(JSON.stringify(payload));
  const signature = config.AGENT_GAMES_HMAC_SECRET ? signBody(raw, config.AGENT_GAMES_HMAC_SECRET) : "";
  res.status(status).set("content-type", "application/json").set("x-agent-games-signature", signature).send(raw);
}
function authenticate(req: Request, res: Response): boolean {
  if (!config.AGENT_GAMES_HMAC_SECRET) { sendSigned(res, 503, { error: "AGENT_NOT_CONFIGURED" }); return false; }
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!verifyBodySignature(raw, req.header("x-agent-games-signature"), config.AGENT_GAMES_HMAC_SECRET)) { sendSigned(res, 401, { error: "INVALID_SIGNATURE" }); return false; }
  return true;
}
app.get("/health", (_req, res) => res.json({ ok: true, service: "zkverify-proof-gatekeeper" }));
app.post("/agent", async (req, res) => {
  if (!authenticate(req, res)) return;
  let payload: unknown;
  try { payload = JSON.parse((req.body as Buffer).toString("utf8")); }
  catch { sendSigned(res, 400, { error: "INVALID_JSON" }); return; }
  const preflight = preflightSchema.safeParse(payload);
  if (preflight.success) { sendSigned(res, 200, { ok: true, protocolVersion: "v1" }); return; }
  const parsed = gatekeeperTaskSchema.safeParse(payload);
  if (!parsed.success) { sendSigned(res, 400, { decision: "REJECT", reason_code: "INVALID_TASK" }); return; }
  try { sendSigned(res, 200, await handleTask(parsed.data, seen)); }
  catch { sendSigned(res, 200, { decision: "REJECT", reason_code: "INTERNAL_ERROR", proof_tx: parsed.data.input.proof_tx }); }
});
export function createServer() { return app; }
