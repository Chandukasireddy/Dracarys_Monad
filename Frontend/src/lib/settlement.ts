import { isAddressEqual, type Address, type PublicClient } from 'viem';
import { DRACARYS_ABI } from './contract';

const SECONDS_PER_DAY = 86400n;

export type MissedDay = { slacker: Address; day: bigint };

export type Settlement = {
  /** MON already moved from `me` to other members for missed days. */
  lost: bigint;
  /** MON already moved to `me` from other members' missed days. */
  won: bigint;
  /** MON `me` can collect now from friends' finished, unsettled missed days. */
  collectable: bigint;
  /** Finished missed days whose stake has not moved yet, in the order they get settled. */
  unsettled: MissedDay[];
};

/**
 * Works out, from on-chain state, which missed days have already been burned.
 *
 * The deployed escrow does not record which days were burned, only the running pool. Each burn
 * moves one daily stake out of the pool, so the number of burns so far is
 * (deposits - stakes returned for approved days - pool) / daily stake. Missed days are settled
 * in a fixed order (by day, then member), so the first N of them are the burned ones.
 * A missed day is a finished day with no proof submitted; pending proofs are never burned.
 */
export async function readSettlement(
  client: PublicClient,
  contract: Address,
  streakId: bigint,
  me: Address,
): Promise<Settlement | null> {
  const [streak, members] = await client.multicall({
    allowFailure: false,
    contracts: [
      { address: contract, abi: DRACARYS_ABI, functionName: 'streaks', args: [streakId] },
      { address: contract, abi: DRACARYS_ABI, functionName: 'getStreakMembers', args: [streakId] },
    ],
  });
  const [, , , dailyStake, totalDays, startTime, pool] = streak;
  // A burn only pays out when someone else is in the challenge.
  if (members.length < 2 || startTime === 0n) return null;

  const { timestamp } = await client.getBlock();
  const currentDay = (timestamp - startTime) / SECONDS_PER_DAY + 1n;
  const lastDay = currentDay - 1n < totalDays ? currentDay - 1n : totalDays;

  const days = Array.from({ length: Number(lastDay) }, (_, i) => BigInt(i + 1));
  const results = await client.multicall({
    allowFailure: false,
    contracts: [
      ...members.map((m) => ({
        address: contract,
        abi: DRACARYS_ABI,
        functionName: 'participants' as const,
        args: [streakId, m] as const,
      })),
      ...days.flatMap((day) =>
        members.map((m) => ({
          address: contract,
          abi: DRACARYS_ABI,
          functionName: 'checkIns' as const,
          args: [streakId, m, day] as const,
        })),
      ),
    ],
  });

  const participants = results.slice(0, members.length) as unknown as readonly [
    Address,
    bigint,
    bigint,
    bigint,
    boolean,
    boolean,
  ][];
  const checkIns = results.slice(members.length) as unknown as readonly [string, bigint, bigint, boolean][];

  const missed: MissedDay[] = [];
  days.forEach((day, d) =>
    members.forEach((m, i) => {
      const [proofUri, , , approved] = checkIns[d * members.length + i];
      if (!proofUri && !approved) missed.push({ slacker: m, day });
    }),
  );

  const deposits = participants.reduce((sum, p) => sum + p[1], 0n);
  const returned = participants.reduce((sum, p) => sum + p[2] * dailyStake, 0n);
  const burnedTotal = deposits - returned - pool;
  const share = dailyStake / BigInt(members.length - 1);
  const perBurn = share * BigInt(members.length - 1);
  const burns = burnedTotal > 0n && perBurn > 0n ? Number(burnedTotal / perBurn) : 0;

  const burned = missed.slice(0, burns);
  const unsettled = missed.slice(burns);
  const mine = (m: MissedDay) => isAddressEqual(m.slacker, me);
  return {
    lost: BigInt(burned.filter(mine).length) * dailyStake,
    won: BigInt(burned.filter((m) => !mine(m)).length) * share,
    collectable: BigInt(unsettled.filter((m) => !mine(m)).length) * share,
    unsettled,
  };
}
