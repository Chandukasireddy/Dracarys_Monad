// Deployed DracarysEscrow Contract Configuration on Monad Testnet (Chain ID 10143)
export const DEFAULT_DRACARYS_CONTRACT_ADDRESS =
  '0x77547711ea2726F16C8BCeDD37a347C139D346E7' as const;
export const DRACARYS_CHAIN_ID = 10143 as const;
export const DRACARYS_RPC_URL = 'https://testnet-rpc.monad.xyz' as const;
export const DRACARYS_EXPLORER_URL = 'https://testnet.monadvision.com' as const;

export const DRACARYS_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_DRACARYS_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_STREAKER_CONTRACT_ADDRESS ||
  DEFAULT_DRACARYS_CONTRACT_ADDRESS) as `0x${string}`;

export const DRACARYS_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'CompletionRewardClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalDeposited',
        type: 'uint256',
      },
    ],
    name: 'FlameJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'day',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'payoutAmount',
        type: 'uint256',
      },
    ],
    name: 'FlameKindled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'day',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'proofUri',
        type: 'string',
      },
    ],
    name: 'ProofSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'slacker',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'day',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'burnedAmount',
        type: 'uint256',
      },
    ],
    name: 'StakeBurned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'refund',
        type: 'uint256',
      },
    ],
    name: 'StreakCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'title',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'dailyStake',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalDays',
        type: 'uint256',
      },
    ],
    name: 'StreakIgnited',
    type: 'event',
  },
  {
    inputs: [],
    name: 'SECONDS_PER_DAY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_friend',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_day',
        type: 'uint256',
      },
    ],
    name: 'approveCheckIn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_slacker',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_day',
        type: 'uint256',
      },
    ],
    name: 'burnSlacker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
    ],
    name: 'cancelStreak',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'checkIns',
    outputs: [
      {
        internalType: 'string',
        name: 'proofUri',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'approvalCount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
    ],
    name: 'claimCompletionReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'completionRewardClaimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'dayBurned',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'forfeited',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'getMemberSummary',
    outputs: [
      {
        internalType: 'uint256',
        name: 'lost',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'won',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'missedDays',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'unsettledDays',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'rewardClaimed',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
    ],
    name: 'getStreakMembers',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'hasApproved',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_title',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_dailyStake',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_totalDays',
        type: 'uint256',
      },
    ],
    name: 'igniteStreak',
    outputs: [
      {
        internalType: 'uint256',
        name: 'streakId',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
    ],
    name: 'joinStreak',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextStreakId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'participants',
    outputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalDeposited',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'claimedDays',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastCheckInDay',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'hasJoined',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isBurned',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
    ],
    name: 'settle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'streakMembers',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'streaks',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'title',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'dailyStake',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalDays',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalPool',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'participantCount',
        type: 'uint256',
      },
      {
        internalType: 'enum DracarysEscrow.StreakStatus',
        name: 'status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_streakId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_proofUri',
        type: 'string',
      },
    ],
    name: 'submitProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'winnings',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
