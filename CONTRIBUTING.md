# Contributing to AgentBond

Thanks for your interest in contributing! AgentBond is a Solana Devnet project — a token launchpad where every token funds a working agent (Meteora DBC → DAMM v2 → agent service).

## Ground rules

- **Devnet only.** The app is hard-locked to Solana Devnet. Any change that touches mainnet, real funds, or custody of user keys will be rejected.
- **Non-custodial by design.** Keypairs are generated in the browser and never leave it. Never commit secrets, private keys, or mnemonics — operator keys live outside the repo (see `.env.example` for the shape).
- **Quotes before writes.** Every transaction must derive `minimumAmountOut` from a live quote — never a hardcoded `0`.

## Getting started

```bash
corepack enable
pnpm install
pnpm check   # typecheck
npx vitest run   # unit tests
pnpm build   # typecheck + client build + server bundle
```

Smoke-test locally: `pnpm dev` (client) or review `DEVNET_DEPLOYMENT_GUIDE.md` for the full devnet setup.

## Pull requests

1. Fork, create a feature branch from `main`.
2. Keep changes minimal and focused — one concern per PR.
3. Make sure `pnpm check`, `npx vitest run`, and `pnpm build` all pass (CI enforces this).
4. Add or update tests for behavior changes. Tests must run offline (mock RPC/SDK calls).
5. Describe **what** changed and **why**; link any related issue.

## Reporting issues

Use the issue templates. For security-sensitive findings (key handling, transaction safety), see [SECURITY.md](SECURITY.md) — please do not open public issues for those.
