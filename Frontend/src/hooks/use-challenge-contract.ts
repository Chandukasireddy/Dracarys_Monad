'use client';
import { useConnection, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi';
import { isAddress, parseEther, encodeFunctionData, type Address, type Hex } from 'viem';
import { monadTestnet } from '@/lib/chain';
import {
  DRACARYS_CONTRACT_ADDRESS,
  DRACARYS_ABI,
  DRACARYS_CHAIN_ID,
} from '@/lib/contract';

export function useChallengeContract() {
  const { address, chainId } = useConnection();
  const publicClient = usePublicClient({ chainId: monadTestnet.id });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const contractAddress =
    DRACARYS_CONTRACT_ADDRESS && isAddress(DRACARYS_CONTRACT_ADDRESS)
      ? (DRACARYS_CONTRACT_ADDRESS as Address)
      : undefined;

  async function execute(data: Hex, value = 0n) {
    if (!contractAddress)
      throw new Error('Dracarys contract not configured.');
    if (!address || !walletClient || !publicClient)
      throw new Error('Connect an injected wallet (MetaMask / Monad compatible) first.');
    if (chainId !== monadTestnet.id) {
      await switchChainAsync({ chainId: monadTestnet.id });
      throw new Error('Network switched. Retry your action on Monad Testnet.');
    }

    const request = { to: contractAddress, data, account: address, value };
    const gas = await publicClient.estimateGas(request);
    await publicClient.call({ ...request, gas });
    const hash = await walletClient.sendTransaction({ ...request, gas, chain: monadTestnet });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('The transaction reverted on Monad.');
    return receipt;
  }

  return {
    configured: Boolean(contractAddress),
    contractAddress,
    chainId: DRACARYS_CHAIN_ID,

    // Monad Dracarys Contract Actions
    igniteStreak: (title: string, duration: number, dailyStake: string) => {
      const stakeWei = parseEther(dailyStake);
      const totalDeposit = stakeWei * BigInt(duration);
      return execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'igniteStreak',
          args: [title, stakeWei, BigInt(duration)],
        }),
        totalDeposit,
      );
    },

    joinStreak: async (streakId: bigint) => {
      if (!contractAddress || !publicClient) throw new Error('Dracarys contract not configured.');
      // Read the exact deposit from the escrow so the joiner's stake always matches the creator's.
      const streak = await publicClient.readContract({
        address: contractAddress,
        abi: DRACARYS_ABI,
        functionName: 'streaks',
        args: [streakId],
      });
      const totalDeposit = streak[3] * streak[4];
      return execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'joinStreak',
          args: [streakId],
        }),
        totalDeposit,
      );
    },

    submitProof: (streakId: bigint, proofUri: string) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'submitProof',
          args: [streakId, proofUri],
        }),
      ),

    approveCheckIn: (streakId: bigint, friend: Address, day: bigint) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'approveCheckIn',
          args: [streakId, friend, day],
        }),
      ),

    burnSlacker: (streakId: bigint, slacker: Address, day: bigint) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'burnSlacker',
          args: [streakId, slacker, day],
        }),
      ),

    claimCompletionReward: (streakId: bigint) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'claimCompletionReward',
          args: [streakId],
        }),
      ),

    cancelStreak: (streakId: bigint) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'cancelStreak',
          args: [streakId],
        }),
      ),

    // Backwards-compatible adapters for existing UI callers
    createChallenge: (title: string, duration: number, dailyStake: string) => {
      const stakeWei = parseEther(dailyStake);
      const totalDeposit = stakeWei * BigInt(duration);
      return execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'igniteStreak',
          args: [title, stakeWei, BigInt(duration)],
        }),
        totalDeposit,
      );
    },
    joinChallenge: (id: bigint, deposit: string) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'joinStreak',
          args: [id],
        }),
        parseEther(deposit),
      ),
    checkIn: (id: bigint, proofHash: string) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'submitProof',
          args: [id, proofHash],
        }),
      ),
    approveFriend: (id: bigint, friend: Address, day: bigint) =>
      execute(
        encodeFunctionData({
          abi: DRACARYS_ABI,
          functionName: 'approveCheckIn',
          args: [id, friend, day],
        }),
      ),
  };
}
