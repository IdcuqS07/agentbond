# Security Policy

## Supported scope

AgentBond runs on **Solana Devnet only** with test assets of no monetary value. Still, we take transaction-safety and key-handling seriously because the architecture is intended to be mainnet-ready.

## Reporting a vulnerability

Email: **idcuq@users.noreply.github.com** (or open a GitHub security advisory via the repository's *Security* tab).

Please do **not** open a public issue for security-sensitive findings.

## What counts as security-sensitive here

- Private key handling (operator/agent keypairs must never enter the repo, logs, or client bundle)
- Transaction construction: missing slippage protection, `minimumAmountOut` of 0, unchecked account derivations (PDA seeds)
- Cross-origin wallet interactions (Phantom signing flows)
- Metadata hosting / URL handling on the launch path

## Design invariants

If you find code violating these, please report it:

1. `assertDevnetEnvironment()` guards every write path — no mainnet escape hatch.
2. Mint keypairs are generated client-side and never serialized to storage or logs.
3. Every swap/migration derives its minimum-out from a live quote with bounded slippage.
4. The agent service signs only with `AGENT_PRIVATE_KEY` from an env file outside the repo.
