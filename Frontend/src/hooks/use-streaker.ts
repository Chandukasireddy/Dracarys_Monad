'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { parseEther, formatEther } from 'viem';
import { initialState } from '@/lib/mock-data';
import { Challenge, DemoState, dayKey, challengeDates, UserProfile, Approval } from '@/lib/types';

const STORAGE = 'dracarys-session-v2';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dracarys-monad-z59m.vercel.app';

function generateId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function useStreaker() {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const current = useRef(state);

  // Sync state helper
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

  const loadRegisteredUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users)) {
          setRegisteredUsers(users);
        }
      }
    } catch (err) {
      console.warn('Failed to load registered users:', err);
    }
  }, []);

  // Fetch remote streaks, approvals & invitations for authenticated user
  const syncWithBackend = useCallback(async (user: UserProfile | null) => {
    loadRegisteredUsers();
    if (!user) return;
    try {
      const [streaksRes, pendingRes, invRes] = await Promise.all([
        fetch(`${API_URL}/api/streaks?user_id=${encodeURIComponent(user.id)}`).catch(() => null),
        fetch(`${API_URL}/api/streaks/pending-approvals?user_id=${encodeURIComponent(user.id)}`).catch(() => null),
        fetch(`${API_URL}/api/streaks/invitations?user_id=${encodeURIComponent(user.id)}`).catch(() => null),
      ]);

      if (streaksRes && streaksRes.ok) {
        const remoteStreaks = await streaksRes.json();
        if (Array.isArray(remoteStreaks)) {
          update((s) => ({
            ...s,
            challenges: remoteStreaks.map((rs: any) => ({
              id: rs.id,
              title: rs.title,
              description: rs.description || 'Kindle your flame. A stronger you.',
              kind: rs.kind || 'fitness',
              duration: rs.duration || 7,
              dailyStake: rs.daily_stake || '0.05',
              completed: rs.completed_days || 0,
              inviteCode: rs.invite_code || `DRA-${rs.id.slice(0, 6).toUpperCase()}`,
              members: rs.member_count || 1,
              checkInDates: [],
            })),
          }));
        }
      }

      if (pendingRes && pendingRes.ok) {
        const remotePending = await pendingRes.json();
        if (Array.isArray(remotePending)) {
          const mapped: Approval[] = remotePending.map((p: any) => ({
            id: p.id,
            name: p.participant_address ? `${p.participant_address.slice(0, 6)}…${p.participant_address.slice(-4)}` : p.user_id,
            initials: (p.user_id || 'AJ').slice(0, 2).toUpperCase(),
            color: 'orange',
            challenge: `Day ${p.day_index} Proof`,
            kind: (p.proof_type as any) || 'fitness',
            streak: p.day_index,
            note: p.notes || 'Daily proof uploaded on Monad',
            approved: p.status === 'APPROVED',
          }));
          update((s) => ({ ...s, approvals: mapped }));
        }
      }

      if (invRes && invRes.ok) {
        const remoteInvs = await invRes.json();
        if (Array.isArray(remoteInvs)) {
          update((s) => ({
            ...s,
            invitations: remoteInvs.filter((i: any) => i.status === 'pending'),
          }));
        }
      }
    } catch (err) {
      console.warn('Backend sync failed, using local cache:', err);
    }
  }, [update, loadRegisteredUsers]);

  // Initial load
  useEffect(() => {
    loadRegisteredUsers();
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const value = JSON.parse(raw);
        if (value && typeof value === 'object') {
          current.current = {
            sound: value.sound ?? true,
            joinedCodes: Array.isArray(value.joinedCodes) ? value.joinedCodes : [],
            user: value.user || null,
            challenges: Array.isArray(value.challenges) ? value.challenges : [],
            approvals: Array.isArray(value.approvals) ? value.approvals : [],
            invitations: Array.isArray(value.invitations) ? value.invitations : [],
          };
          setState(current.current);
          if (value.user) {
            syncWithBackend(value.user);
          }
        }
      }
    } catch {
      setStorageWarning(true);
    }
    setReady(true);
  }, [syncWithBackend, loadRegisteredUsers]);

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
    async (
      input: Pick<Challenge, 'title' | 'duration' | 'dailyStake' | 'kind'> & {
        onchainId?: string;
      },
    ) => {
      const tempId = generateId();
      const code = `DRA-${tempId.slice(0, 6).toUpperCase()}`;
      const user = current.current.user;

      const challenge: Challenge = {
        ...input,
        id: tempId,
        description: 'Kindle your flame. A stronger you.',
        completed: 0,
        checkInDates: [],
        inviteCode: code,
        members: 1,
      };

      update((s) => ({ ...s, challenges: [...s.challenges, challenge] }));

      // Save to backend database
      try {
        const res = await fetch(`${API_URL}/api/streaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: input.title,
            kind: input.kind,
            duration: input.duration,
            daily_stake: input.dailyStake,
            creator_id: user?.id || 'creator',
            creator_address: user?.wallet_address || undefined,
          }),
        });
        if (res.ok) {
          const remote = await res.json();
          // Update with remote ID & invite code
          update((s) => ({
            ...s,
            challenges: s.challenges.map((c) =>
              c.id === tempId
                ? {
                    ...c,
                    id: remote.id,
                    inviteCode: remote.invite_code || c.inviteCode,
                  }
                : c,
            ),
          }));
        }
      } catch (e) {
        console.warn('Backend streak save failed, cached locally:', e);
      }

      return challenge;
    },
    [update],
  );

  const joinChallenge = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (current.current.joinedCodes.includes(normalized))
        throw new Error('You have already joined this challenge.');
      if (current.current.challenges.some((c) => c.inviteCode === normalized))
        throw new Error('This challenge is already in your streaks.');

      const user = current.current.user;

      // Query backend for real challenge with this invite code
      try {
        const res = await fetch(`${API_URL}/api/streaks/invite/${encodeURIComponent(normalized)}`);
        if (res.ok) {
          const remote = await res.json();
          // Join on backend
          await fetch(`${API_URL}/api/streaks/${remote.id}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user?.id || 'anon-joiner',
              wallet_address: user?.wallet_address || undefined,
            }),
          }).catch(() => null);

          const challenge: Challenge = {
            id: remote.id,
            title: remote.title,
            description: remote.description || 'Kindle your flame together.',
            kind: remote.kind || 'fitness',
            duration: remote.duration || 7,
            dailyStake: remote.daily_stake || '0.05',
            completed: 0,
            checkInDates: [],
            inviteCode: normalized,
            members: (remote.member_count || 1) + 1,
          };

          update((s) => ({
            ...s,
            challenges: [...s.challenges, challenge],
            joinedCodes: [...s.joinedCodes, normalized],
          }));
          return challenge;
        }
      } catch {
        // Continue to fallback
      }

      // If backend offline or custom code
      const challenge: Challenge = {
        id: generateId(),
        title: `Challenge ${normalized}`,
        description: 'Joined via invite code. Keep the flame burning.',
        kind: 'fitness',
        duration: 7,
        dailyStake: '0.05',
        completed: 0,
        checkInDates: [],
        inviteCode: normalized,
        members: 2,
      };
      update((s) => ({
        ...s,
        challenges: [...s.challenges, challenge],
        joinedCodes: [...s.joinedCodes, normalized],
      }));
      return challenge;
    },
    [update],
  );

  const approveFriend = useCallback(
    async (id: string) => {
      update((s) => ({
        ...s,
        approvals: s.approvals.map((a) => (a.id === id ? { ...a, approved: true } : a)),
      }));

      // Send to backend
      const user = current.current.user;
      try {
        await fetch(`${API_URL}/api/streaks/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streak_id: 'streak',
            proof_id: id,
            approver: user?.wallet_address || user?.username || 'peer',
            approved: true,
            comment: 'Verified on Monad 🔥',
          }),
        });
      } catch (e) {
        console.warn('Backend verification call failed:', e);
      }
    },
    [update],
  );

  const loginUser = useCallback(
    (user: UserProfile) => {
      update((s) => ({ ...s, user }));
      syncWithBackend(user);
    },
    [update, syncWithBackend],
  );

  const logoutUser = useCallback(() => {
    update((s) => ({
      ...s,
      user: null,
      challenges: [],
      approvals: [],
      joinedCodes: [],
    }));
    try {
      localStorage.removeItem(STORAGE);
    } catch {}
  }, [update]);

  const updateUser = useCallback(
    (updates: Partial<UserProfile>) => {
      update((s) => ({
        ...s,
        user: s.user ? { ...s.user, ...updates } : null,
      }));
    },
    [update],
  );

  const inviteFriend = useCallback(
    async (streakId: string, inviteeIdentifier: string) => {
      const user = current.current.user;
      if (!user) throw new Error('Please log in to invite friends.');
      const res = await fetch(`${API_URL}/api/streaks/${encodeURIComponent(streakId)}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviter_id: user.id,
          invitee_identifier: inviteeIdentifier,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to send challenge invite.' }));
        throw new Error(err.detail || 'Failed to send challenge invite.');
      }
      return await res.json();
    },
    [],
  );

  const respondToInvitation = useCallback(
    async (invitationId: string, accept: boolean) => {
      const user = current.current.user;
      const res = await fetch(`${API_URL}/api/streaks/invitations/${encodeURIComponent(invitationId)}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accept,
          user_id: user?.id,
          wallet_address: user?.wallet_address,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to respond to invitation.' }));
        throw new Error(err.detail || 'Failed to respond to invitation.');
      }
      const data = await res.json();
      // Remove from pending invitations
      update((s) => ({
        ...s,
        invitations: s.invitations.filter((i) => i.id !== invitationId),
      }));

      // If accepted, add the streak to challenges list if present
      if (accept && data.streak) {
        const rs = data.streak;
        const newChallenge: Challenge = {
          id: rs.id,
          title: rs.title,
          description: rs.description || 'Kindle your flame together.',
          kind: rs.kind || 'fitness',
          duration: rs.duration || 7,
          dailyStake: rs.daily_stake || '0.05',
          completed: 0,
          checkInDates: [],
          inviteCode: rs.invite_code || `DRA-${rs.id.slice(0, 6).toUpperCase()}`,
          members: (rs.member_count || 1) + 1,
        };
        update((s) => ({
          ...s,
          challenges: s.challenges.some((c) => c.id === newChallenge.id)
            ? s.challenges
            : [...s.challenges, newChallenge],
          joinedCodes: [...s.joinedCodes, newChallenge.inviteCode],
        }));
      }
      return data;
    },
    [update],
  );

  const setSound = (sound: boolean) => update((s) => ({ ...s, sound }));
  const reset = () => update(() => initialState());

  return {
    ...state,
    ready,
    storageWarning,
    registeredUsers,
    checkIn,
    createChallenge,
    joinChallenge,
    inviteFriend,
    respondToInvitation,
    loadRegisteredUsers,
    syncWithBackend,
    approveFriend,
    loginUser,
    logoutUser,
    updateUser,
    setSound,
    reset,
  };
}

export const useDracarys = useStreaker;

export function stakeTotal(stake: string, days: number) {
  try {
    return formatEther(parseEther(stake) * BigInt(days));
  } catch {
    return '0.00';
  }
}
