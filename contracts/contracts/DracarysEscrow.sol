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
    mapping(uint256 => mapping(address => bool)) public completionRewardClaimed;
    // streakId => userAddress => dayIndex => missed day already burned
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public dayBurned;
    // streakId => userAddress => MON lost to other members for missed days
    mapping(uint256 => mapping(address => uint256)) public forfeited;
    // streakId => userAddress => MON won from other members (missed-day shares + completion reward)
    mapping(uint256 => mapping(address => uint256)) public winnings;

    // Events for Monad execution event streaming (monadNewHeads / monadLogs)
    event StreakIgnited(uint256 indexed streakId, string title, address indexed creator, uint256 dailyStake, uint256 totalDays);
    event FlameJoined(uint256 indexed streakId, address indexed user, uint256 totalDeposited);
    event ProofSubmitted(uint256 indexed streakId, address indexed user, uint256 indexed day, string proofUri);
    event FlameKindled(uint256 indexed streakId, address indexed user, uint256 indexed day, address approver, uint256 payoutAmount);
    event StakeBurned(uint256 indexed streakId, address indexed slacker, uint256 indexed day, uint256 burnedAmount);
    event CompletionRewardClaimed(uint256 indexed streakId, address indexed winner, uint256 reward);
    event StreakCancelled(uint256 indexed streakId, address indexed creator, uint256 refund);

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
        require(!dayBurned[_streakId][_friend][_day], "Dracarys: Day already settled");

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
     * @notice Slash a slacker: once a day is over with no proof submitted, that day's stake
     *         moves to the members who did check in that day.
     */
    function burnSlacker(uint256 _streakId, address _slacker, uint256 _day) external {
        HabitStreak storage s = streaks[_streakId];
        require(participants[_streakId][_slacker].hasJoined, "Dracarys: User not in streak");
        require(_day >= 1 && _day <= s.totalDays, "Dracarys: Invalid day");
        require(_currentDay(s) > _day, "Dracarys: Day is not over yet");
        require(!dayBurned[_streakId][_slacker][_day], "Dracarys: Day already settled");
        require(bytes(checkIns[_streakId][_slacker][_day].proofUri).length == 0, "Dracarys: Proof was submitted");
        require(s.totalPool >= s.dailyStake, "Dracarys: Insufficient pool balance");
        _burn(_streakId, _slacker, _day);
    }

    /**
     * @notice Settles every finished day in one transaction: unapproved proofs count as check-ins
     *         (so an opponent cannot block a winner by never approving), and missed days are burned
     *         to the members who showed up that day.
     */
    function settle(uint256 _streakId) external onlyMember(_streakId) {
        HabitStreak storage s = streaks[_streakId];
        uint256 lastDay = _currentDay(s) - 1;
        _settle(_streakId, lastDay < s.totalDays ? lastDay : s.totalDays);
    }

    /**
     * @notice After the streak ends, settles any open days and pays each member who checked in every
     *         day an equal share of what is left in the pool (the losers' unreturned stake).
     */
    function claimCompletionReward(uint256 _streakId) external onlyMember(_streakId) {
        HabitStreak storage s = streaks[_streakId];
        require(block.timestamp >= s.startTime + (s.totalDays * SECONDS_PER_DAY), "Dracarys: Streak is still active");
        require(!completionRewardClaimed[_streakId][msg.sender], "Dracarys: Reward already claimed");
        _settle(_streakId, s.totalDays);

        Participant storage winner = participants[_streakId][msg.sender];
        require(!winner.isBurned, "Dracarys: Participant was burned");
        require(winner.claimedDays >= s.totalDays, "Dracarys: Complete every day first");

        uint256 winnerCount = 0;
        address[] memory members = streakMembers[_streakId];
        for (uint256 i = 0; i < members.length; i++) {
            Participant storage participant = participants[_streakId][members[i]];
            if (
                !participant.isBurned &&
                participant.claimedDays >= s.totalDays &&
                !completionRewardClaimed[_streakId][members[i]]
            ) winnerCount++;
        }

        uint256 reward = s.totalPool / winnerCount;
        completionRewardClaimed[_streakId][msg.sender] = true;
        s.totalPool -= reward;
        winnings[_streakId][msg.sender] += reward;
        if (s.totalPool == 0) s.status = StreakStatus.COMPLETED;

        if (reward > 0) {
            (bool sent, ) = payable(msg.sender).call{value: reward}("");
            require(sent, "Dracarys: Failed to deliver completion reward");
        }
        emit CompletionRewardClaimed(_streakId, msg.sender, reward);
    }

    function _settle(uint256 _streakId, uint256 _lastDay) internal {
        HabitStreak storage s = streaks[_streakId];
        address[] memory members = streakMembers[_streakId];
        for (uint256 day = 1; day <= _lastDay; day++) {
            for (uint256 i = 0; i < members.length; i++) {
                CheckInProof storage proof = checkIns[_streakId][members[i]][day];
                if (proof.approved || dayBurned[_streakId][members[i]][day]) continue;
                if (bytes(proof.proofUri).length > 0) {
                    _executeKindle(_streakId, members[i], day);
                } else if (s.totalPool >= s.dailyStake) {
                    _burn(_streakId, members[i], day);
                }
            }
        }
    }

    function _burn(uint256 _streakId, address _slacker, uint256 _day) internal {
        HabitStreak storage s = streaks[_streakId];
        uint256 burnedAmount = s.dailyStake;
        dayBurned[_streakId][_slacker][_day] = true;
        participants[_streakId][_slacker].isBurned = true;
        forfeited[_streakId][_slacker] += burnedAmount;

        // The stake goes to the members who checked in on that day.
        address[] memory members = streakMembers[_streakId];
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] != _slacker && bytes(checkIns[_streakId][members[i]][_day].proofUri).length > 0) {
                eligibleCount++;
            }
        }

        if (eligibleCount > 0) {
            uint256 share = burnedAmount / eligibleCount;
            s.totalPool -= (share * eligibleCount);
            for (uint256 i = 0; i < members.length; i++) {
                address m = members[i];
                if (m != _slacker && bytes(checkIns[_streakId][m][_day].proofUri).length > 0) {
                    winnings[_streakId][m] += share;
                    (bool sent, ) = payable(m).call{value: share}("");
                    require(sent, "Dracarys: Reward transfer failed");
                }
            }
        }

        emit StakeBurned(_streakId, _slacker, _day, burnedAmount);
    }

    function _currentDay(HabitStreak storage s) internal view returns (uint256) {
        return ((block.timestamp - s.startTime) / SECONDS_PER_DAY) + 1;
    }

    function cancelStreak(uint256 _streakId) external {
        HabitStreak storage s = streaks[_streakId];
        require(msg.sender == s.creator, "Dracarys: Only creator can cancel");
        require(s.status == StreakStatus.ACTIVE, "Dracarys: Streak is not active");
        require(s.participantCount == 1, "Dracarys: Leave the group before cancelling");
        require(block.timestamp < s.startTime + SECONDS_PER_DAY, "Dracarys: Streak has started");

        uint256 refund = s.totalPool;
        s.totalPool = 0;
        s.status = StreakStatus.CANCELLED;
        participants[_streakId][msg.sender].isBurned = true;
        (bool sent, ) = payable(msg.sender).call{value: refund}("");
        require(sent, "Dracarys: Failed to refund commitment");
        emit StreakCancelled(_streakId, msg.sender, refund);
    }

    // View helpers
    function getStreakMembers(uint256 _streakId) external view returns (address[] memory) {
        return streakMembers[_streakId];
    }

    /**
     * @notice Money summary for one member, used by the app for deducted / won notifications.
     *         unsettledDays counts finished days (any member) that `settle` would still pay out or burn.
     */
    function getMemberSummary(uint256 _streakId, address _user)
        external
        view
        returns (uint256 lost, uint256 won, uint256 missedDays, uint256 unsettledDays, bool rewardClaimed)
    {
        HabitStreak storage s = streaks[_streakId];
        uint256 lastDay = s.startTime == 0 ? 0 : _currentDay(s) - 1;
        if (lastDay > s.totalDays) lastDay = s.totalDays;
        address[] memory members = streakMembers[_streakId];
        for (uint256 day = 1; day <= lastDay; day++) {
            if (bytes(checkIns[_streakId][_user][day].proofUri).length == 0) missedDays++;
            for (uint256 i = 0; i < members.length; i++) {
                if (!checkIns[_streakId][members[i]][day].approved && !dayBurned[_streakId][members[i]][day]) {
                    unsettledDays++;
                }
            }
        }
        return (forfeited[_streakId][_user], winnings[_streakId][_user], missedDays, unsettledDays, completionRewardClaimed[_streakId][_user]);
    }
}
