import { access } from "node:fs/promises";
import { groth16 } from "snarkjs";
import type { ProofBundle } from "../types.js";
export interface GatekeeperWitness { [key: string]: string | number | boolean | bigint; }
/** Witness keys must match the official Circom circuit; this adapter is not used by the default handler. */
export async function generateGatekeeperProof(witness: GatekeeperWitness, wasmPath: string, zkeyPath: string): Promise<ProofBundle> {
  await access(wasmPath);
  await access(zkeyPath);
  const result = await groth16.fullProve(witness, wasmPath, zkeyPath);
  return { proof: result.proof, public_signals: result.publicSignals.map(String) };
}
