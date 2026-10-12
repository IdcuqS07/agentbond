<!-- One concern per PR. Keep changes minimal and focused. -->

## What & why

<!-- What changed, and why it is needed. Link related issues. -->

## How tested

- [ ] `pnpm check` (typecheck)
- [ ] `npx vitest run` (unit tests; new/changed behavior covered, tests run offline)
- [ ] `pnpm build`
- [ ] Manual devnet verification (if applicable): signature/explorer link —

## Invariants

- [ ] Devnet-only, no mainnet paths
- [ ] Non-custodial: no secrets/keys committed, mint keypairs never serialized
- [ ] All writes derive `minimumAmountOut` from a live quote (never 0)
