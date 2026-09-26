'use client';
import { useConnection, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi';
import { isAddress, parseAbi, parseEther, encodeFunctionData, type Address, type Hex } from 'viem';
import { monadTestnet } from '@/lib/chain';

// Proposed integration interface only. Replace with the deployed contract's ABI before enabling.
export const challengeAbi = parseAbi([
  'function createChallenge(string title, uint256 duration, uint256 dailyStake) payable returns (uint256)',
  'function joinChallenge(uint256 challengeId) payable',
  'function checkIn(uint256 challengeId, bytes32 proofHash)',
  'function approveFriend(uint256 challengeId, address friend, uint256 day)',
]);
export function useChallengeContract() {
  const { address, chainId } = useConnection();
  const publicClient = usePublicClient({ chainId: monadTestnet.id });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const configuredAddress = process.env.NEXT_PUBLIC_STREAKER_CONTRACT_ADDRESS;
  const contractAddress =
    configuredAddress && isAddress(configuredAddress) ? (configuredAddress as Address) : undefined;
  async function execute(data: Hex, value = 0n) {
    if (!contractAddress)
      throw new Error('Contract not configured. Demo actions never send transactions.');
    if (!address || !walletClient || !publicClient)
      throw new Error('Connect an injected wallet first.');
    if (chainId !== monadTestnet.id) {
      await switchChainAsync({ chainId: monadTestnet.id });
      throw new Error('Network switched. Retry your action on Monad Testnet.');
    }
    const request = { to: contractAddress, data, account: address, value };
    const gas = await publicClient.estimateGas(request);
    await publicClient.call({ ...request, gas });
    const hash = await walletClient.sendTransaction({ ...request, gas, chain: monadTestnet });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('The transaction reverted.');
    return receipt;
  }
  return {
    configured: Boolean(contractAddress),
    createChallenge: (title: string, duration: number, dailyStake: string) =>
      execute(
        encodeFunctionData({
          abi: challengeAbi,
          functionName: 'createChallenge',
          args: [title, BigInt(duration), parseEther(dailyStake)],
        }),
        parseEther(dailyStake) * BigInt(duration),
      ),
    joinChallenge: (id: bigint, deposit: string) =>
      execute(
        encodeFunctionData({ abi: challengeAbi, functionName: 'joinChallenge', args: [id] }),
        parseEther(deposit),
      ),
    checkIn: (id: bigint, proofHash: Hex) =>
      execute(
        encodeFunctionData({ abi: challengeAbi, functionName: 'checkIn', args: [id, proofHash] }),
      ),
    approveFriend: (id: bigint, friend: Address, day: bigint) =>
      execute(
        encodeFunctionData({
          abi: challengeAbi,
          functionName: 'approveFriend',
          args: [id, friend, day],
        }),
      ),
  };
}
