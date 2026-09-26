export type HabitKind = 'fitness' | 'reading' | 'mindfulness';
export type Challenge = {
  id: string;
  onchainId?: string;
  creatorId?: string;
  title: string;
  description: string;
  kind: HabitKind;
  duration: number;
  dailyStake: string;
  completed: number;
  checkInDates?: string[];
  lastCheckIn?: string;
  inviteCode: string;
  members: number;
  earnedUsd?: number;
  lockedUsd?: number;
};
export type Approval = {
  id: string;
  name: string;
  initials: string;
  color: string;
  challenge: string;
  kind: HabitKind;
  streak: number;
  note: string;
  approved: boolean;
  address?: string;
  onchainId?: string;
  day?: number;
};
export type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  wallet_address?: string;
  bio: string;
  avatar_color: string;
  initials: string;
  streak_count?: number;
  total_earned_mon?: number;
};

export type Invitation = {
  id: string;
  streak_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: number;
  streak_title: string;
  streak_description?: string;
  streak_kind: HabitKind;
  streak_duration: number;
  streak_stake: string;
  streak_invite_code: string;
  inviter_name?: string;
  inviter_username?: string;
  inviter_color?: string;
};

export type DemoState = {
  challenges: Challenge[];
  approvals: Approval[];
  invitations: Invitation[];
  sound: boolean;
  joinedCodes: string[];
  user: UserProfile | null;
};
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function pastDays(
  count: number,
  end = new Date(new Date().setDate(new Date().getDate() - 1)),
) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(end);
    date.setDate(date.getDate() - count + i + 1);
    return dayKey(date);
  });
}
export function challengeDates(challenge: Challenge): string[] {
  return (
    challenge.checkInDates ??
    pastDays(
      challenge.completed,
      challenge.lastCheckIn ? new Date(challenge.lastCheckIn + 'T12:00:00') : undefined,
    )
  );
}
export function longestRun(dates: string[]): number {
  const days = [...new Set(dates)].sort();
  let best = 0,
    run = 0,
    previous = 0;
  for (const day of days) {
    const timestamp = Date.parse(day + 'T00:00:00Z');
    run = timestamp - previous === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = timestamp;
  }
  return best;
}
export function currentRun(dates: string[]): number {
  const values = new Set(dates);
  const date = new Date();
  if (!values.has(dayKey(date))) date.setDate(date.getDate() - 1);
  let run = 0;
  while (values.has(dayKey(date))) {
    run++;
    date.setDate(date.getDate() - 1);
  }
  return run;
}
