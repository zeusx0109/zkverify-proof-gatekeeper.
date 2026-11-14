import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  AGENT_GAMES_HMAC_SECRET: z.string().min(1).optional(),
  KURIER_API_KEY: z.string().optional(),
  KURIER_API_URL: z.string().url().default("https://api.kurier.xyz/api/v1"),
  GATEKEEPER_VK_HASH: z.string().default("0x6b79c6012a6d8651f3e13bc4d2a20370280ab49700c90c5316d4168bfbad77b0"),
  GATEKEEPER_WASM_PATH: z.string().default("artifacts/gatekeeper.wasm"),
  GATEKEEPER_ZKEY_PATH: z.string().default("artifacts/gatekeeper_final.zkey"),
  TASK_TIMEOUT_MS: z.coerce.number().int().positive().max(55_000).default(45_000),
  SEEN_PROOFS_FILE: z.string().default("data/seen-proofs.json")
});

export const config = envSchema.parse(process.env);
