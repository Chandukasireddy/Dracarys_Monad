'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { parseEther, formatEther } from 'viem';
import { initialState } from '@/lib/mock-data';
import { Challenge, DemoState, dayKey, challengeDates } from '@/lib/types';

const STORAGE = 'dracarys-demo-v1';
const LEGACY_STORAGE = 'streaker-demo-v1';

// getRandomValues also works on a phone visiting a local HTTP development server.
function demoId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function useStreaker() {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const current = useRef(state);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE) || localStorage.getItem(LEGACY_STORAGE);
      if (raw) {
        const value = JSON.parse(raw);
        if (
          Array.isArray(value.challenges) &&
          Array.isArray(value.approvals) &&
          Array.isArray(value.joinedCodes) &&
          value.challenges.every(
            (c: Challenge) =>
              typeof c.id === 'string' &&
              typeof c.title === 'string' &&
              Number.isInteger(c.completed) &&
              Number.isInteger(c.duration) &&
              typeof c.dailyStake === 'string' &&
              /^\d+(\.\d{1,18})?$/.test(c.dailyStake),
          )
        ) {
          current.current = value;
          setState(value);
        }
      }
    } catch {
      setStorageWarning(true);
    }
    setReady(true);
  }, []);

  const update = useCallback((fn: (s: DemoState) => DemoState) => {
    const next = fn(current.current);
    current.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      setStorageWarning(true);
    }
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      const challenge = current.current.challenges.find((c) => c.id === id);
      if (
        !challenge ||
        challenge.lastCheckIn === dayKey() ||
        challenge.completed >= challenge.duration
      )
        return false;
      update((s) => ({
        ...s,
        challenges: s.challenges.map((c) =>
          c.id === id
            ? {
                ...c,
                completed: c.completed + 1,
                checkInDates: [...challengeDates(c), dayKey()],
                lastCheckIn: dayKey(),
                earnedUsd:
                  c.earnedUsd === undefined
                    ? undefined
                    : Math.min(c.lockedUsd ?? 5, c.earnedUsd + 0.24),
              }
            : c,
        ),
      }));
      return true;
    },
    [update],
  );

  const createChallenge = useCallback(
    (input: Pick<Challenge, 'title' | 'duration' | 'dailyStake' | 'kind'>) => {
      const challenge: Challenge = {
        ...input,
        id: demoId(),
        description: 'Kindle your flame. A stronger you.',
        completed: 0,
        checkInDates: [],
        inviteCode: `DRA-${demoId().slice(0, 6).toUpperCase()}`,
        members: 1,
      };
      update((s) => ({ ...s, challenges: [...s.challenges, challenge] }));
      return challenge;
    },
    [update],
  );

  const joinChallenge = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (current.current.joinedCodes.includes(normalized))
        throw new Error('You have already joined this challenge.');
      if (current.current.challenges.some((c) => c.inviteCode === normalized))
        throw new Error('This challenge is already in your streaks.');
      if (normalized !== 'DRA-WALK7' && normalized !== 'STR-WALK7')
        throw new Error('Invite not found in this demo. Try DRA-WALK7.');
      const challenge: Challenge = {
        id: demoId(),
        title: 'Take the scenic route.',
        description: 'Walk 5,000 steps every day.',
        kind: 'fitness',
        duration: 7,
        dailyStake: '0.1',
        completed: 0,
        checkInDates: [],
        inviteCode: normalized,
        members: 5,
      };
      update((s) => ({
        ...s,
        challenges: [...s.challenges, challenge],
        joinedCodes: [...s.joinedCodes, normalized],
      }));
    },
    [update],
  );

  const approveFriend = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        approvals: s.approvals.map((a) => (a.id === id ? { ...a, approved: true } : a)),
      })),
    [update],
  );

  const setSound = (sound: boolean) => update((s) => ({ ...s, sound }));
  const reset = () => update(() => initialState());

  return {
    ...state,
    ready,
    storageWarning,
    checkIn,
    createChallenge,
    joinChallenge,
    approveFriend,
    setSound,
    reset,
  };
}

export const useDracarys = useStreaker;

export function stakeTotal(stake: string, days: number) {
  return formatEther(parseEther(stake) * BigInt(days));
}
