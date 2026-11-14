import type { GatekeeperTask, Decision } from "./types.js";
import type { SeenProofStore } from "./security/seen-proofs.js";
import { evaluateCondition } from "./policy/decision.js";
import { config } from "./config.js";

export interface AgentResponse extends Decision {
  proof?: unknown;
  public_signals?: string[];
}

export async function handleTask(task: GatekeeperTask, seen: SeenProofStore): Promise<AgentResponse> {
  const policy = await evaluateCondition(task, seen, config.GATEKEEPER_VK_HASH);
  if (policy.decision === "REJECT") {
    if (task.input.proof_tx) await seen.add(task.input.proof_tx);
    return policy;
  }
  // Fail closed until official witness mapping, proof generation and Kurier finalization are verified.
  return { decision: "REJECT", reason_code: "PROOF_PIPELINE_NOT_CONFIGURED", proof_tx: task.input.proof_tx };
}
