import type { GatekeeperTask, Decision } from "../types.js";
import type { SeenProofStore } from "../security/seen-proofs.js";

export async function evaluateCondition(
  task: GatekeeperTask,
  seen: SeenProofStore,
  expectedVkHash: string
): Promise<Decision> {
  const input = task.input;

  // Fail closed: an unknown/missing reference cannot be treated as a fresh proof.
  if (!input.proof_tx || await seen.has(input.proof_tx)) {
    return { decision: "REJECT", reason_code: "PROOF_REUSED", proof_tx: input.proof_tx };
  }
  if (normalizeHex(input.registered_vk) !== normalizeHex(expectedVkHash) ||
      normalizeHex(input.proof_vk) !== normalizeHex(input.registered_vk)) {
    return { decision: "REJECT", reason_code: "VK_SUBSTITUTION", proof_tx: input.proof_tx };
  }
  if (BigInt(input.public_balance) < BigInt(input.minimum)) {
    return { decision: "REJECT", reason_code: "THRESHOLD_MISMATCH", proof_tx: input.proof_tx };
  }
  if (input.current_block > input.expiry_block) {
    return { decision: "REJECT", reason_code: "EXPIRED_CONDITION", proof_tx: input.proof_tx };
  }
  if (normalizeAddress(input.recipient) !== normalizeAddress(input.condition_recipient)) {
    return { decision: "REJECT", reason_code: "RECIPIENT_MISMATCH", proof_tx: input.proof_tx };
  }
  if (BigInt(input.amount) > BigInt(input.max_transfer)) {
    return { decision: "REJECT", reason_code: "AMOUNT_OVERFLOW", proof_tx: input.proof_tx };
  }

  return { decision: "APPROVE", reason_code: "VALID_CONDITION", proof_tx: input.proof_tx };
}

function normalizeHex(value: string): string {
  return value.toLowerCase().replace(/^0x/, "");
}
function normalizeAddress(value: string): string {
  return value.toLowerCase();
}
