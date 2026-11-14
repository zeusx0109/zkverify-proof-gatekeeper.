import { z } from "zod";
export const gatekeeperTaskSchema = z.object({
  type: z.literal("agent-games.proof-gatekeeper.v1"), task_id: z.string().min(1),
  mode: z.enum(["practice", "competition"]).or(z.string()), issued_at: z.string(), deadline_at: z.string(),
  input: z.object({
    registered_vk: z.string().min(1), proof_vk: z.string().min(1),
    minimum: z.string().regex(/^\d+$/), public_balance: z.string().regex(/^\d+$/),
    expiry_block: z.number().int().nonnegative(), current_block: z.number().int().nonnegative(),
    recipient: z.string().min(1), condition_recipient: z.string().min(1),
    amount: z.string().regex(/^\d+$/), max_transfer: z.string().regex(/^\d+$/), proof_tx: z.string().min(1)
  }).passthrough()
}).passthrough();
export type GatekeeperTask = z.infer<typeof gatekeeperTaskSchema>;
export const preflightSchema = z.object({ type: z.literal("agent-games.preflight.v1"), agent_id: z.string(), issued_at: z.string(), nonce: z.string() }).passthrough();
export type AgentDecision = "APPROVE" | "REJECT";
export interface Decision { decision: AgentDecision; reason_code: string; proof_tx?: string; }
export interface ProofBundle { proof: unknown; public_signals: string[]; }
