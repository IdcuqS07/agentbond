import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Droplets, ExternalLink, Loader2, RefreshCw, Send } from "lucide-react";
import {
  AGENT_FAUCET_FEE_SOL,
  AGENT_MEMO_MAX_CHARS,
  AGENT_MIN_PAYMENT_SOL,
  buildAgentFaucetRequestTx,
  buildAgentTaskPaymentTx,
  fetchAgentActivity,
  getTestnetAddressUrl,
  type AgentActivityItem,
  type SolanaProvider,
} from "@/lib/meteora";
import type { PoolRecord } from "@/lib/poolRegistry";

function short(value: string) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

const KIND_LABEL: Record<AgentActivityItem["kind"], string> = {
  task: "TASK",
  reply: "REPLY",
  buyback: "BUYBACK",
  other: "ACTIVITY",
};

/**
 * Pay-per-task: the user pays the agent's service wallet directly on-chain
 * (SOL transfer + prompt memo). The agent answers via memo transactions and
 * spends part of each payment buying back its own token — the buyback is a
 * normal on-chain swap, verifiable on the Explorer.
 */
export function AgentServicePanel({
  pool,
  wallet,
  walletProvider,
}: {
  pool: PoolRecord;
  wallet: string | null;
  walletProvider: SolanaProvider | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [faucetBusy, setFaucetBusy] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);
  const [activity, setActivity] = useState<AgentActivityItem[] | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const loadActivity = useCallback(() => {
    if (!pool.agentWallet) return;
    setLoadingFeed(true);
    fetchAgentActivity({
      agentWallet: pool.agentWallet,
      dammV2Pool: pool.dammV2Pool,
    })
      .then(items => setActivity(items))
      .catch(() => setActivity(null))
      .finally(() => setLoadingFeed(false));
  }, [pool.agentWallet, pool.dammV2Pool]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const sendTask = async () => {
    if (!wallet || !walletProvider || !pool.agentWallet) return;
    setBusy(true);
    setMessage(null);
    try {
      const payment = await buildAgentTaskPaymentTx({
        payer: wallet,
        agentWallet: pool.agentWallet,
        amountSol: Number(amount),
        prompt,
      });
      const { transaction, connection, blockhash, lastValidBlockHeight } = payment;
      let signature: string;
      if (walletProvider.signAndSendTransaction) {
        signature = (await walletProvider.signAndSendTransaction(transaction)).signature;
      } else if (walletProvider.sendTransaction) {
        signature = await walletProvider.sendTransaction(transaction, connection);
      } else {
        throw new Error("Connected wallet cannot send transactions");
      }
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      setPrompt("");
      setMessage(
        `Task sent — the agent replies on-chain within a minute. Refresh the feed below to see the answer and the buyback.`
      );
      setTimeout(loadActivity, 2000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Task payment failed or was rejected");
    } finally {
      setBusy(false);
    }
  };

  const requestFaucet = async () => {
    if (!wallet || !walletProvider || !pool.agentWallet) return;
    setFaucetBusy(true);
    setFaucetMessage(null);
    try {
      const request = await buildAgentFaucetRequestTx({
        payer: wallet,
        agentWallet: pool.agentWallet,
      });
      const { transaction, connection, blockhash, lastValidBlockHeight } = request;
      let signature: string;
      if (walletProvider.signAndSendTransaction) {
        signature = (await walletProvider.signAndSendTransaction(transaction)).signature;
      } else if (walletProvider.sendTransaction) {
        signature = await walletProvider.sendTransaction(transaction, connection);
      } else {
        throw new Error("Connected wallet cannot send transactions");
      }
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      setFaucetMessage(
        `Faucet request sent — the agent drips ${pool.symbol} back on-chain within a minute (1 h cooldown per wallet). Refresh the feed below to see the drip.`
      );
      setTimeout(loadActivity, 2000);
    } catch (error) {
      setFaucetMessage(error instanceof Error ? error.message : "Faucet request failed or was rejected");
    } finally {
      setFaucetBusy(false);
    }
  };

  return (
    <div className="lp-panel">
      <div className="lp-head">
        <span className="tiny-label">AGENT SERVICE · {pool.symbol}/SOL</span>
        <span className="lab-mode">PAY-PER-TASK</span>
      </div>
      <p className="lp-note">
        Hire the agent with a direct on-chain payment: your SOL transfer carries the prompt as a memo.
        The agent answers on-chain and buys back {pool.symbol} with part of every payment — all verifiable
        on the Explorer. Minimum {AGENT_MIN_PAYMENT_SOL} SOL.
      </p>
      <div className="lp-row">
        <label className="amount-field compact lp-input">
          <span>TASK <b>≤ {AGENT_MEMO_MAX_CHARS} chars</b></span>
          <input
            value={prompt}
            maxLength={AGENT_MEMO_MAX_CHARS}
            placeholder="Ask the agent anything — the memo is your prompt"
            onChange={event => setPrompt(event.target.value)}
          />
        </label>
        <label className="amount-field compact" style={{ width: 110 }}>
          <span>PAY <b>SOL</b></span>
          <input type="number" min={AGENT_MIN_PAYMENT_SOL} step="0.0005" value={amount} onChange={event => setAmount(event.target.value)} />
        </label>
      </div>
      <div className="lp-row" style={{ justifyContent: "space-between" }}>
        <a href={getTestnetAddressUrl(pool.agentWallet ?? "")} target="_blank" rel="noreferrer" className="lp-note" style={{ margin: 0 }}>
          Agent wallet {short(pool.agentWallet ?? "")} <ExternalLink size={11} />
        </a>
        <button className="button button-primary" onClick={sendTask} disabled={busy || !wallet || !walletProvider || !pool.agentWallet}>
          {busy ? <Loader2 className="spin" size={14} /> : <Send size={14} />} {wallet ? "Send task" : "Connect wallet to hire"}
        </button>
      </div>
      {message && <p className="lp-note">{message}</p>}
      <div className="lp-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <p className="lp-note" style={{ margin: 0 }}>
          Need {pool.symbol} for swaps or LP? Pay {AGENT_FAUCET_FEE_SOL} SOL with a FAUCET memo and the agent
          drips {pool.symbol} back on-chain — one request per hour.
        </p>
        <button
          className="button button-ghost"
          style={{ flexShrink: 0 }}
          onClick={requestFaucet}
          disabled={faucetBusy || !wallet || !walletProvider || !pool.agentWallet}
        >
          {faucetBusy ? <Loader2 className="spin" size={14} /> : <Droplets size={14} />}
          {wallet ? `Faucet ${pool.symbol}` : "Connect wallet for faucet"}
        </button>
      </div>
      {faucetMessage && <p className="lp-note">{faucetMessage}</p>}
      <div className="lp-positions">
        <div className="lp-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
          <small>ON-CHAIN FEED</small>
          <button className="button button-ghost small" onClick={loadActivity} disabled={loadingFeed}>
            <RefreshCw size={12} className={loadingFeed ? "spin" : ""} /> Refresh
          </button>
        </div>
        {activity && activity.length === 0 && <p className="lp-note">No agent activity yet — be the first to hire it.</p>}
        {(activity ?? []).slice(0, 8).map(item => (
          <div key={item.signature} className="lp-position-row">
            <span>
              <Bot size={11} style={{ verticalAlign: "-1px" }} /> <b>{KIND_LABEL[item.kind]}</b>
              {item.amountSol ? ` · ${item.amountSol.toFixed(4)} SOL` : ""}
              {item.memo ? ` · ${item.memo.slice(0, 64)}${item.memo.length > 64 ? "…" : ""}` : ""}
              {item.kind === "task" && item.counterparty ? ` · from ${short(item.counterparty)}` : ""}
            </span>
            <a href={item.explorerUrl} target="_blank" rel="noreferrer"><ExternalLink size={12} /></a>
          </div>
        ))}
      </div>
    </div>
  );
}
