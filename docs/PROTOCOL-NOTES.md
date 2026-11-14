# Protocol notes (verify before production)

Source of truth:
- https://agentgames.zkverify.io/events/proof-gatekeeper
- https://agentgames.zkverify.io/build

The event expects a signed inbound task, deterministic policy evaluation, a response within 60 seconds, and an independently verifiable Groth16 proof for provable tasks. The build guide says the platform expects the proof and `public_signals` in the response and signs the raw response body with `x-agent-games-signature`.

The event's public task example lists `registered_vk`, `proof_vk`, `minimum`, `public_balance`, `expiry_block`, `current_block`, `recipient`, `condition_recipient`, `amount`, `max_transfer`, and `proof_tx`.

Published Gatekeeper VK hash: `0x6b79c6012a6d8651f3e13bc4d2a20370280ab49700c90c5316d4168bfbad77b0`.

Do not assume public task fields constitute the exact Circom witness. Obtain official circuit source/artifacts and map witness inputs exactly before enabling proof generation. Confirm the Kurier job lookup route and response fields from current docs before production.
