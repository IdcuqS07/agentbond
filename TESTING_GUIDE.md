# Testing Guide — AgentBond Public Testnet (Solana Devnet)

Last updated: Oct 12, 2026
App: https://agentbond-umber.vercel.app
Network: **Solana Devnet** — all assets are test tokens with no real monetary value.

---

## 1. Setup (±10 minutes)

| Step | Detail |
|---|---|
| 1. Install Phantom | https://phantom.app (Chrome/Brave/Firefox browser extension, or mobile app) |
| 2. Create a new wallet | Use a **dedicated testing wallet**, not your main wallet |
| 3. Enable Devnet mode | Phantom → Settings → Developer Settings → **Testnet/Devnet Mode: ON** |
| 4. Fund with Devnet SOL | Official faucet: https://faucet.solana.com (paste your wallet address; 0.5–1 SOL is enough). Alternative: Phantom's deposit button (sometimes rate-limited). |
| 5. Record your test data | Note: wallet address, test time, steps taken, and transaction links (Explorer) |

> The Devnet faucet is rate-limited per IP. If it fails, retry after a few minutes or switch networks.

---

## 2. Test Scenarios

### A. Wallet Connection & First View

| # | Step | Expected result |
|---|---|---|
| A1 | Open https://agentbond-umber.vercel.app | Home page loads, headline "Live Solana Devnet Lab" |
| A2 | Click "Connect Phantom" and approve the popup | Wallet address shown (short form `AbC1…xYz`), SOL balance displayed |
| A3 | Open the nav menu → **Pools** | `/pools` page opens (no 404), shows 1 entry "AgentBond (AGNT)" with the **CANONICAL** badge |

### B. Swap on the DAMM v2 Venue (core feature)

| # | Step | Expected result |
|---|---|---|
| B1 | On the home page, make sure the **DAMM v2** venue is active, direction `SOL → AGNT` | Quote appears automatically once an amount is entered |
| B2 | Enter amount `0.01` SOL | Shows: ESTIMATED OUTPUT ≈ **194,000–196,000 AGNT**, MINIMUM AFTER SLIPPAGE slightly below it, PRICE IMPACT honestly displayed (large number because the pool is small) |
| B3 | Click **Send swap transaction** | Phantom popup appears → approve |
| B4 | Wait for confirmation | Shows "Swap confirmed on Devnet" + a **View on Explorer** link |
| B5 | Open the Explorer link (URL must contain `?cluster=devnet`) | Transaction successful (`Success`, no errors), AGNT arrives in the wallet (check the token tab in Phantom) |
| B6 | Reverse direction: `AGNT → SOL`, swap a small amount of AGNT | Same as B3–B5, SOL arrives in the wallet |
| B7 | Set slippage to `0.1`, then swap a large AGNT→SOL amount | Transaction **may fail** with a slippage message — this is correct behavior (protection); record the error message |
| B8 | Enter amount `0` or negative | Swap button disabled / no quote appears — must not crash |
| B9 | Disconnect the wallet, then click swap | Shows a "Connect a wallet…" message — must not crash |

### C. Swap on the DLMM Venue

| # | Step | Expected result |
|---|---|---|
| C1 | Select the **AGNT** pool, click the **DLMM** venue tab | Label changes to "METEORA DLMM SWAP" |
| C2 | Enter `0.01` SOL | Quote ≈ 190,000–200,000 AGNT (comparable to DAMM v2, price impact ±16% — the pool is intentionally small) |
| C3 | Swap and confirm in Phantom | Success + valid Explorer link |
| C4 | Try swapping AGNT → SOL on DLMM | Works in both directions |
| C5 | Select another pool (non-AGNT, if any) | The DLMM tab **disappears** — the DLMM venue is AGNT-only |

### D. Launching a New Token

| # | Step | Expected result |
|---|---|---|
| D1 | Menu → **Launch** | `/launch` form: name, symbol, IMAGE URL, METADATA URI, first buy |
| D2 | Enter any name/symbol (e.g. `Test Coin` / `TST`), paste any public image URL (e.g. `https://…/logo.png`), first buy `0.01` SOL | Live first-buy quote + fee estimate appear (total ± 0.02–0.03 SOL) |
| D3 | Click **Host metadata** | Phantom popup (Irys devnet storage upload, small SOL fraction) → METADATA URI auto-filled starting with `https://devnet.irys.xyz/` |
| D4 | Submit the launch | **Two Phantom popups in a row**: Tx1 creates the mint + Metaplex metadata, Tx2 creates the pool + first buy |
| D5 | After success | Redirected to the new pool; pool appears in `/pools` with the **UNVERIFIED** badge + disclaimer |
| D6 | Check Tx1 & Tx2 on Explorer | 2 successful transactions; new mint visible in the wallet |
| D7 | Check the mint in Phantom / Explorer | Token shows **name, symbol, and logo** (not "Unknown Token") — because Metaplex metadata is created in Tx1 |
| D8 | Swap on the new pool (DAMM v2 venue) | Works — the new pool gets a DAMM v2 market on creation |
| D9 | Close the browser, reopen `/pools` | Your launched pool is still listed (localStorage). In a different browser: click **Refresh on-chain** → the pool is detected from on-chain data |
| D10 | Click **Refresh on-chain** on `/pools` | A note shows how many pools were found from the on-chain scan; no duplicates with pools already shown |

### E. Lifecycle & Graduation (optional, expensive)

> Requires the bonding curve to be ~100% filled (many buys). Test only if you have Devnet SOL budget to spare.

| # | Step | Expected result |
|---|---|---|
| E1 | Open a newly launched pool on the home page | The **LIFECYCLE** panel shows curve progress (0–100%) |
| E2 | Buy repeatedly until progress ≥ 100% | The **Trigger graduation** button becomes active |
| E3 | Click Trigger graduation | Phantom popup (migration transaction) → confirm |
| E4 | After success | Status changes to "MIGRATED TO DAMM V2", pool is registered with its DAMM v2 address |
| E5 | Canonical AGNT pool | Lifecycle shows **MIGRATED TO DAMM V2** — the graduation button must not appear |

### F. Liquidity / LP (DAMM v2)

| # | Step | Expected result |
|---|---|---|
| F1 | On the AGNT pool (or a graduated pool), find the **Liquidity** panel | Deposit panel + positions list shown |
| F2 | Deposit `0.05` SOL | Phantom popup → confirm → new position appears in the list (position NFT owned by your wallet) |
| F3 | Withdraw the position (pick a percentage, check the preview) | Phantom popup → confirm → token balance returns, position reduced/removed |
| F4 | Check Explorer | Amounts out/in consistent with the preview |
| F5 | Withdraw 100% on a small position | Succeeds; note the notice that removal executes at the pool's current price |

### G. Edge Cases & Resilience

| # | Step | Expected result |
|---|---|---|
| G1 | Reject the Phantom popup at any point | Friendly error message in the UI, no crash, can retry |
| G2 | Enter slippage `0` or `50` | Rejected with a message (valid range 0.1–10%) |
| G3 | Switch Phantom network to Mainnet, then try a swap | Transaction **fails/rejected** (network mismatch: the app uses a Devnet RPC) — record the message shown |
| G4 | Click through all tabs/pages quickly | No crashes or blank screens |
| G5 | Refresh the page while a quote is loading | Recovers normally after reload |

### H. DLMM LP (AGNT pool)

| # | Step | Expected result |
|---|---|---|
| H1 | On the AGNT pool, find the **LIQUIDITY · AGNT/SOL BINS** panel | DLMM panel shown (DLMM label) below the DAMM v2 panel |
| H2 | Enter `0.02` SOL → **Add bid ladder** | Phantom popup → confirm → new position appears with a bin range below the active price |
| H3 | Positions list | Each position shows its short address, bin range, and SOL + AGNT balances inside |
| H4 | **50%** on one position | Phantom popup → confirm → half the liquidity withdrawn |
| H5 | **100%** on the same position | Position fully withdrawn **and closed**; disappears from the list after refresh |

### I. Agent Service (pay-per-task) — AGNT pool

> The agent service is an operator-run process. If the feed is empty, the agent may be offline — report it as "agent offline", not an app bug.

| # | Step | Expected result |
|---|---|---|
| I1 | On the AGNT pool, find the **AGENT SERVICE** panel | Panel with a TASK box, payment amount, and on-chain feed |
| I2 | Write a short question (≤500 chars), PAY `0.001` SOL → **Send task** | Phantom popup: SOL transfer to the agent wallet + memo (prompt) |
| I3 | After confirmation, click **Refresh** on the feed | Your **TASK** appears (address + prompt) |
| I4 | Wait ±30–60 seconds, click **Refresh** again | A **REPLY** appears (agent's answer as an on-chain memo) and a **BUYBACK** (agent swaps 50% of the payment into its own token on the DAMM v2 market) |
| I5 | Click the Explorer link on the BUYBACK | Transaction successful, agent gained X AGNT and spent SOL — verifiable token sink |
| I6 | Send a task with an empty prompt | Rejected with a message — must not crash |
| I7 | Ask market data: "What is the AGNT price right now?" | Answer contains real numbers checkable on Explorer (spot price, pool liquidity, agent treasury) — not a generic reply |

**AGNT Faucet** (for testers who need free AGNT tokens):

| # | Step | Expected result |
|---|---|---|
| FA1 | Click the **Faucet AGNT** button on the Agent Service panel (connect the wallet first if needed) | Phantom asks approval for a 0.0005 SOL transfer with memo `FAUCET` |
| FA2 | After success, click **Refresh** on the feed after ±1 minute | The agent sends **±50,000 AGNT** to your wallet (the `FAUCET` memo is visible in the feed) — check your AGNT balance |
| FA3 | Try the faucet again within 1 hour | The agent skips it (1-hour cooldown per wallet) — no second drip before the cooldown expires |
| FA4 | Note | Requires the agent service to be running (operator); without the bot online, the request is still sent but the drip happens when the bot comes back online |

---

## 3. Known Limitations (not bugs)

- The **DLMM venue is AGNT-only**; newly launched pools trade on DAMM v2 after creation (a DLMM pool is not created automatically).
- The pool registry is stored **per browser** (localStorage), but the **Refresh on-chain** button can detect launched pools from on-chain data in any browser.
- Launched tokens carry the **UNVERIFIED** badge — only AGNT is CANONICAL. Watch out for fake tokens imitating the name.
- The creator fee claim only appears for wallets that **are the pool's creator** (check the Lifecycle panel).
- No mainnet; the UI is locked to Devnet.
- Liquidity is small: price impact can be large on big swaps — this is expected on a Devnet pool.

## 4. How to Report Bugs

Include in your report:

1. **Reproduction steps** (ordered, concise)
2. **Wallet address** and **time of occurrence**
3. **Explorer transaction link** (if any): `https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet`
4. **Screenshot** of the Phantom popup / the error message in the UI
5. Browser + OS used
6. Expected vs actual behavior

Quick template:

```
Title: [Feature] - short description
Steps: 1) ... 2) ... 3) ...
Expected: ...
Actual: ...
Wallet: ...
Tx: https://explorer.solana.com/tx/...?cluster=devnet
Browser: ...
```

## 5. Quick Reference

| Item | Value |
|---|---|
| App | https://agentbond-umber.vercel.app |
| Pages | `/` (swap+lab), `/pools` (registry), `/launch` (create token) |
| Canonical AGNT pool | DBC `9UfcuHMV…` · DAMM v2 `Aw25vo…` · DLMM `GxtUfNFw…` |
| Devnet Explorer | https://explorer.solana.com/?cluster=devnet |
| Devnet SOL faucet | https://faucet.solana.com |
| Default slippage | 1% (valid range 0.1–10%) |
| Reference quote | 0.01 SOL ≈ 194,000–196,000 AGNT (both venues, as of Sep 30, 2026) |
