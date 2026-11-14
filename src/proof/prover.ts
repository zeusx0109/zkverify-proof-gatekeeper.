import { access } from "node:fs/promises";
import { groth16 } from "snarkjs";
import type { ProofBundle } from "../types.js";

export interface GatekeeperWitness {
  [key: string]: string | number | boolean | bigint;
}

/**
 * The exact witness keys must match the official Circom circuit.
 * Do not guess the witness layout: map it only after reviewing the official
 * circuit source / build artifacts. Until then, this adapter is intentionally
 * not called by the default request handler.
 */
export async function generateGatekeeperProof(
  witness: GatekeeperWitness,
  wasmPath: string,
  zkeyPath: string
): Promise<ProofBundle> {
  await access(wasmPath);
  await access(zkeyPath);
  const result = await groth16.fullProve(witness, wasmPath, zkeyPath);
  return {
    proof: result.proof,
    public_signals: result.publicSignals.map(String)
  };
}
