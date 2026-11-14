import "dotenv/config";
import { readFile } from "node:fs/promises";
import { generateGatekeeperProof } from "../src/proof/prover.js";

const inputPath = process.argv[2] ?? "artifacts/witness.json";
const witness = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, string | number | boolean>;
const wasm = process.env.GATEKEEPER_WASM_PATH ?? "artifacts/gatekeeper.wasm";
const zkey = process.env.GATEKEEPER_ZKEY_PATH ?? "artifacts/gatekeeper_final.zkey";
const result = await generateGatekeeperProof(witness, wasm, zkey);
console.log(JSON.stringify(result, null, 2));
