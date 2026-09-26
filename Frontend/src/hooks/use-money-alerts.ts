'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatEther, type Address } from 'viem';
import type { Challenge } from '@/lib/types';
import type { useChallengeContract } from './use-challenge-contract';

export type MoneySummary = {
  challengeId: string;
  onchainId: string;
  title: string;
  lost: bigint;
  won: bigint;
  missedDays: bigint;
  unsettledDays: bigint;
};

const SEEN_KEY = 'streaker-money-seen';
const POLL_MS = 60_000;

function readSeen(address: string): Record<string, { lost: string; won: string }> {
  try {
    return JSON.parse(localStorage.getItem(`${SEEN_KEY}:${address.toLowerCase()}`) || '{}');
  } catch {
    return {};
  }
}

function writeSeen(address: string, seen: Record<string, { lost: string; won: string }>) {
  try {
    localStorage.setItem(`${SEEN_KEY}:${address.toLowerCase()}`, JSON.stringify(seen));
  } catch {}
}

/**
 * Reads each on-chain challenge's money ledger for the connected wallet and reports
 * new deductions and winnings. MetaMask does not list contract payouts, so this is how
 * players learn that MON moved.
 */
export function useMoneyAlerts(
  challenges: Challenge[],
  contract: ReturnType<typeof useChallengeContract>,
  address: Address | undefined,
  onAlert: (message: string) => void,
) {
  const [summaries, setSummaries] = useState<MoneySummary[]>([]);
  const alertRef = useRef(onAlert);
  alertRef.current = onAlert;
  const onchain = challenges.filter((c) => c.onchainId);
  const key = onchain.map((c) => `${c.id}:${c.onchainId}:${c.title}`).join('|');

  const refresh = useCallback(async () => {
    if (!address || !contract.configured) return;
    const next: MoneySummary[] = [];
    for (const c of onchain) {
      try {
        const summary = await contract.getMemberSummary(BigInt(c.onchainId!), address);
        next.push({ challengeId: c.id, onchainId: c.onchainId!, title: c.title, ...summary });
      } catch {
        // Challenges from an older contract have no money summary.
      }
    }
    setSummaries(next);

    const seen = readSeen(address);
    const messages: string[] = [];
    for (const s of next) {
      const before = seen[s.onchainId];
      const lostDelta = s.lost - BigInt(before?.lost ?? '0');
      const wonDelta = s.won - BigInt(before?.won ?? '0');
      if (lostDelta > 0n)
        messages.push(`−${formatEther(lostDelta)} MON deducted: you missed a day in “${s.title}”.`);
      if (wonDelta > 0n)
        messages.push(`+${formatEther(wonDelta)} MON added to your wallet from “${s.title}”.`);
      seen[s.onchainId] = { lost: s.lost.toString(), won: s.won.toString() };
    }
    writeSeen(address, seen);
    if (messages.length) alertRef.current(messages.join(' '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, contract.configured, key]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  return { summaries, refresh };
}
