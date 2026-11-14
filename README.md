# zkVerify Proof Gatekeeper

TypeScript + Node.js starter agent for zkVerify Agent Games — Proof Gatekeeper.

> This is a protocol scaffold, not a competition-ready prover. It deliberately fails closed until the official circuit witness mapping, Groth16 proof pipeline, Kurier finalization, and live response contract have been validated end-to-end.

## Features

- `POST /agent` task endpoint with raw-body HMAC authentication.
- Signed preflight response.
- Deterministic checks for verification-key substitution, threshold mismatch, proof reuse, expiry, recipient mismatch, and amount overflow.
- Local Groth16 proof adapter using snarkjs when official circuit artifacts are supplied.
- Kurier submission adapter and finalization polling.
- Unit tests, Dockerfile, and GitHub Actions CI.

## Requirements

- Node.js 20+
- Agent Games agent secret
- Kurier API key for the REST flow
- Official `gatekeeper.wasm` and `gatekeeper_final.zkey` artifacts

## Quick start

```bash
npm install
cp .env.example .env
npm run typecheck
npm test
npm run dev
```

Download the official circuit artifacts from https://agentgames.zkverify.io/build and place them in `artifacts/`. Never commit secrets or private keys.

## Safety

The starter rejects otherwise-valid tasks with `PROOF_PIPELINE_NOT_CONFIGURED` until the official witness mapping and end-to-end proof submission are verified. Do not treat this scaffold as production-ready or claim successful on-chain verification without a finalized proof.

See [docs/PROTOCOL-NOTES.md](docs/PROTOCOL-NOTES.md) and [artifacts/README.md](artifacts/README.md).

## License

MIT
