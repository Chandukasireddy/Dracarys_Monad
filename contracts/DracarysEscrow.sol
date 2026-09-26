// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DracarysEscrow 🐉🔥
 * @notice Social habit staking protocol on Monad.
 *         "Feed the flame every day or get burned."
 *         Users lock micro-stakes (e.g. 0.05 MON/day). Completing streaks unlocks micro-payouts
 *         in 0.3s; slacking burns the stake to the dragon pool & faithful friends.
 */
contract DracarysEscrow {
    enum StreakStatus { ACTIVE, COMPLETED, CANCELLED }

    struct HabitStreak {
        uint256 id;
        string title;
        address creator;
        uint256 dailyStake;       // e.g. 0.05 MON in wei
        uint256 totalDays;        // e.g. 7 days
        uint256 startTime;
        uint256 totalPool;
        uint256 participantCount;
        StreakStatus status;
    }

    struct Participant {
        address user;
        uint256 totalDeposited;
        uint256 claimedDays;
        uint256 lastCheckInDay;
        bool hasJoined;
        bool isBurned;           // Slashed if flaked out
    }

    struct CheckInProof {
        string proofUri;         // IPFS hash, photo URL, or text verification
        uint256 timestamp;
        uint256 approvalCount;
        bool approved;
    }

    uint256 public nextStreakId = 1;
    uint256 public constant SECONDS_PER_DAY = 1 days;

    // streakId => HabitStreak
    mapping(uint256 => HabitStreak) public streaks;
    // streakId => userAddress => Participant
    mapping(uint256 => mapping(address => Participant)) public participants;
    // streakId => array of participant addresses
    mapping(uint256 => address[]) public streakMembers;
    // streakId => userAddress => dayIndex => CheckInProof
    mapping(uint256 => mapping(address => mapping(uint256 => CheckInProof))) public checkIns;
    // streakId => userAddress => dayIndex => approverAddress => hasApproved
    mapping(uint256 => mapping(address => mapping(uint256 => mapping(address => bool)))) public hasApproved;

    // Events for Monad execution event streaming (monadNewHeads / monadLogs)
    event StreakIgnited(uint256 indexed streakId, string title, address indexed creator, uint256 dailyStake, uint256 totalDays);
    event FlameJoined(uint256 indexed streakId, address indexed user, uint256 totalDeposited);
    event ProofSubmitted(uint256 indexed streakId, address indexed user, uint256 indexed day, string proofUri);
    event FlameKindled(uint256 indexed streakId, address indexed user, uint256 indexed day, address approver, uint256 payoutAmount);
    event StakeBurned(uint256 indexed streakId, address indexed slacker, uint256 indexed day, uint256 burnedAmount);

    modifier onlyMember(uint256 _streakId) {
        require(participants[_streakId][msg.sender].hasJoined, "Dracarys: Not a participant in this flame");
        _;
    }

    /**
     * @notice Ignite a new habit streak by depositing (dailyStake * totalDays).
     */
    function igniteStreak(
        string calldata _title,
        uint256 _dailyStake,
        uint256 _totalDays
    ) external payable returns (uint256 streakId) {
        require(_dailyStake > 0, "Dracarys: Daily stake must be > 0");
        require(_totalDays > 0 && _totalDays <= 365, "Dracarys: Invalid duration");
        uint256 requiredDeposit = _dailyStake * _totalDays;
        require(msg.value == requiredDeposit, "Dracarys: Incorrect MON deposit");

        streakId = nextStreakId++;
        HabitStreak storage s = streaks[streakId];
        s.id = streakId;
        s.title = _title;
        s.creator = msg.sender;
        s.dailyStake = _dailyStake;
        s.totalDays = _totalDays;
        s.startTime = block.timestamp;
        s.totalPool = requiredDeposit;
        s.participantCount = 1;
        s.status = StreakStatus.ACTIVE;

        participants[streakId][msg.sender] = Participant({
            user: msg.sender,
            totalDeposited: requiredDeposit,
            claimedDays: 0,
            lastCheckInDay: 0,
            hasJoined: true,
            isBurned: false
        });

        streakMembers[streakId].push(msg.sender);

        emit StreakIgnited(streakId, _title, msg.sender, _dailyStake, _totalDays);
        emit FlameJoined(streakId, msg.sender, requiredDeposit);
    }

    /**
     * @notice Join an existing friend streak by depositing the required total stake.
     */
    function joinStreak(uint256 _streakId) external payable {
        HabitStreak storage s = streaks[_streakId];
        require(s.status == StreakStatus.ACTIVE, "Dracarys: Streak is not active");
        require(!participants[_streakId][msg.sender].hasJoined, "Dracarys: Already joined");
        
        uint256 requiredDeposit = s.dailyStake * s.totalDays;
        require(msg.value == requiredDeposit, "Dracarys: Incorrect stake sent");

        s.totalPool += requiredDeposit;
        s.participantCount += 1;

        participants[_streakId][msg.sender] = Participant({
            user: msg.sender,
            totalDeposited: requiredDeposit,
            claimedDays: 0,
            lastCheckInDay: 0,
            hasJoined: true,
            isBurned: false
        });

        streakMembers[_streakId].push(msg.sender);

        emit FlameJoined(_streakId, msg.sender, requiredDeposit);
    }

    /**
     * @notice Submit daily proof of habit completion (gym photo, step count, lesson URL).
     */
    function submitProof(uint256 _streakId, string calldata _proofUri) external onlyMember(_streakId) {
        HabitStreak storage s = streaks[_streakId];
        require(s.status == StreakStatus.ACTIVE, "Dracarys: Inactive streak");

        uint256 currentDay = ((block.timestamp - s.startTime) / SECONDS_PER_DAY) + 1;
        require(currentDay <= s.totalDays, "Dracarys: Streak period has concluded");

        CheckInProof storage proof = checkIns[_streakId][msg.sender][currentDay];
        require(bytes(proof.proofUri).length == 0, "Dracarys: Proof already submitted for today");

        proof.proofUri = _proofUri;
        proof.timestamp = block.timestamp;
        proof.approvalCount = 0;
        proof.approved = false;

        emit ProofSubmitted(_streakId, msg.sender, currentDay, _proofUri);

        // If solo streak (1 member), self-verify automatically
        if (s.participantCount == 1) {
            _executeKindle(_streakId, msg.sender, currentDay);
        }
    }

    /**
     * @notice Peer approval: A friend verifies your proof, triggering instant 0.3s micro-payout.
     */
    function approveCheckIn(uint256 _streakId, address _friend, uint256 _day) external onlyMember(_streakId) {
        require(msg.sender != _friend, "Dracarys: Cannot approve your own proof in group streaks");
        CheckInProof storage proof = checkIns[_streakId][_friend][_day];
        require(bytes(proof.proofUri).length > 0, "Dracarys: No proof to approve");
        require(!proof.approved, "Dracarys: Day already approved");
        require(!hasApproved[_streakId][_friend][_day][msg.sender], "Dracarys: Already approved by you");

        hasApproved[_streakId][_friend][_day][msg.sender] = true;
        proof.approvalCount++;

        // In group streaks, 1 approval is enough for instant gratification
        _executeKindle(_streakId, _friend, _day);
    }

    /**
     * @notice Internal payout execution when proof is approved.
     */
    function _executeKindle(uint256 _streakId, address _user, uint256 _day) internal {
        HabitStreak storage s = streaks[_streakId];
        Participant storage p = participants[_streakId][_user];
        CheckInProof storage proof = checkIns[_streakId][_user][_day];

        require(!proof.approved, "Dracarys: Already claimed");
        proof.approved = true;
        p.claimedDays += 1;
        p.lastCheckInDay = _day;

        uint256 payout = s.dailyStake;
        s.totalPool -= payout;

        // Sub-second transfer on Monad
        (bool sent, ) = payable(_user).call{value: payout}("");
        require(sent, "Dracarys: Failed to deliver loot");

        emit FlameKindled(_streakId, _user, _day, msg.sender, payout);
    }

    /**
     * @notice Slash a slacker: If 24h passed for a day without approved check-in, their daily stake is burned/split.
     */
    function burnSlacker(uint256 _streakId, address _slacker, uint256 _day) external {
        HabitStreak storage s = streaks[_streakId];
        Participant storage p = participants[_streakId][_slacker];
        require(p.hasJoined, "Dracarys: User not in streak");

        uint256 currentDay = ((block.timestamp - s.startTime) / SECONDS_PER_DAY) + 1;
        require(currentDay > _day, "Dracarys: Day is not over yet");

        CheckInProof storage proof = checkIns[_streakId][_slacker][_day];
        require(!proof.approved, "Dracarys: Day was approved");

        uint256 burnedAmount = s.dailyStake;
        require(s.totalPool >= burnedAmount, "Dracarys: Insufficient pool balance");

        // Distribute burned stake among faithful members who have active check-ins
        address[] memory members = streakMembers[_streakId];
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] != _slacker && !participants[_streakId][members[i]].isBurned) {
                eligibleCount++;
            }
        }

        if (eligibleCount > 0) {
            uint256 share = burnedAmount / eligibleCount;
            s.totalPool -= (share * eligibleCount);
            for (uint256 i = 0; i < members.length; i++) {
                address m = members[i];
                if (m != _slacker && !participants[_streakId][m].isBurned) {
                    (bool sent, ) = payable(m).call{value: share}("");
                    require(sent, "Dracarys: Reward transfer failed");
                }
            }
        }

        emit StakeBurned(_streakId, _slacker, _day, burnedAmount);
    }

    // View helpers
    function getStreakMembers(uint256 _streakId) external view returns (address[] memory) {
        return streakMembers[_streakId];
    }
}
