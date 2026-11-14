import { describe, expect, it } from "vitest";
import { evaluateCondition } from "../src/policy/decision.js";
import type { GatekeeperTask } from "../src/types.js";
import type { SeenProofStore } from "../src/security/seen-proofs.js";
const vk = "0x6b79c6012a6d8651f3e13bc4d2a20370280ab49700c90c5316d4168bfbad77b0";
const task = (patch: Partial<GatekeeperTask["input"]> = {}): GatekeeperTask => ({
  type: "agent-games.proof-gatekeeper.v1", task_id: "test", mode: "practice",
  issued_at: "2026-11-14T10:00:00.000Z", deadline_at: "2026-11-14T10:01:00.000Z",
  input: { registered_vk: vk, proof_vk: vk, minimum: "1000", public_balance: "1460",
    expiry_block: 100, current_block: 90, recipient: "0xabc", condition_recipient: "0xabc",
    amount: "500", max_transfer: "1000", proof_tx: "0xproof", ...patch }
});
function store(seen: string[] = []): SeenProofStore {
  return { has: async ref => seen.includes(ref.toLowerCase()), add: async () => undefined };
}
describe("Proof Gatekeeper policy", () => {
  it("approves a condition that passes every deterministic check", async () => {
    await expect(evaluateCondition(task(), store(), vk)).resolves.toMatchObject({ decision: "APPROVE", reason_code: "VALID_CONDITION" });
  });
  it("rejects verification key substitution", async () => {
    await expect(evaluateCondition(task({ proof_vk: "0xdead" }), store(), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "VK_SUBSTITUTION" });
  });
  it("rejects threshold mismatch", async () => {
    await expect(evaluateCondition(task({ public_balance: "999" }), store(), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "THRESHOLD_MISMATCH" });
  });
  it("rejects reused proofs", async () => {
    await expect(evaluateCondition(task(), store(["0xproof"]), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "PROOF_REUSED" });
  });
  it("rejects expired conditions", async () => {
    await expect(evaluateCondition(task({ current_block: 101 }), store(), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "EXPIRED_CONDITION" });
  });
  it("rejects recipient mismatch", async () => {
    await expect(evaluateCondition(task({ recipient: "0xdef" }), store(), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "RECIPIENT_MISMATCH" });
  });
  it("rejects amount overflow", async () => {
    await expect(evaluateCondition(task({ amount: "1001" }), store(), vk)).resolves.toMatchObject({ decision: "REJECT", reason_code: "AMOUNT_OVERFLOW" });
  });
});
