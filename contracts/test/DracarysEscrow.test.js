const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DracarysEscrow 🐉🔥", function () {
  let dracarys;
  let owner, friend1, friend2;
  const DAILY_STAKE = ethers.parseEther("0.05"); // 0.05 MON per day
  const TOTAL_DAYS = 7;
  const TOTAL_DEPOSIT = DAILY_STAKE * BigInt(TOTAL_DAYS); // 0.35 MON

  beforeEach(async function () {
    [owner, friend1, friend2] = await ethers.getSigners();
    const DracarysEscrow = await ethers.getContractFactory("DracarysEscrow");
    dracarys = await DracarysEscrow.deploy();
    await dracarys.waitForDeployment();
  });

  it("Should ignite a new streak and deposit initial stake", async function () {
    await expect(
      dracarys.igniteStreak("7-Day 10k Steps Challenge", DAILY_STAKE, TOTAL_DAYS, {
        value: TOTAL_DEPOSIT,
      })
    )
      .to.emit(dracarys, "StreakIgnited")
      .withArgs(1, "7-Day 10k Steps Challenge", owner.address, DAILY_STAKE, TOTAL_DAYS);

    const streak = await dracarys.streaks(1);
    expect(streak.title).to.equal("7-Day 10k Steps Challenge");
    expect(streak.totalPool).to.equal(TOTAL_DEPOSIT);
    expect(streak.participantCount).to.equal(1);
  });

  it("Should allow a friend to join the streak with matching stake", async function () {
    await dracarys.igniteStreak("7-Day 10k Steps Challenge", DAILY_STAKE, TOTAL_DAYS, {
      value: TOTAL_DEPOSIT,
    });

    await expect(
      dracarys.connect(friend1).joinStreak(1, {
        value: TOTAL_DEPOSIT,
      })
    )
      .to.emit(dracarys, "FlameJoined")
      .withArgs(1, friend1.address, TOTAL_DEPOSIT);

    const streak = await dracarys.streaks(1);
    expect(streak.participantCount).to.equal(2);
    expect(streak.totalPool).to.equal(TOTAL_DEPOSIT * 2n);
  });

  it("Should submit daily proof and trigger instant payout upon friend approval", async function () {
    // 1. Owner ignites, friend joins
    await dracarys.igniteStreak("Morning Gym Routine", DAILY_STAKE, TOTAL_DAYS, {
      value: TOTAL_DEPOSIT,
    });
    await dracarys.connect(friend1).joinStreak(1, { value: TOTAL_DEPOSIT });

    // 2. Owner submits proof for Day 1
    const proofUri = "ipfs://QmGymSelfieProofHash123456";
    await expect(dracarys.submitProof(1, proofUri))
      .to.emit(dracarys, "ProofSubmitted")
      .withArgs(1, owner.address, 1, proofUri);

    // 3. Friend1 verifies and approves Day 1
    const initialBalance = await ethers.provider.getBalance(owner.address);

    await expect(dracarys.connect(friend1).approveCheckIn(1, owner.address, 1))
      .to.emit(dracarys, "FlameKindled")
      .withArgs(1, owner.address, 1, friend1.address, DAILY_STAKE);

    const participant = await dracarys.participants(1, owner.address);
    expect(participant.claimedDays).to.equal(1);

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance - initialBalance).to.equal(DAILY_STAKE);
  });

  it("Should pay a completed winner their share of the remaining pool", async function () {
    await dracarys.igniteStreak("One-Day Challenge", DAILY_STAKE, 1, {
      value: DAILY_STAKE,
    });
    await dracarys.connect(friend1).joinStreak(1, { value: DAILY_STAKE });

    await dracarys.submitProof(1, "ipfs://proof");
    await dracarys.connect(friend1).approveCheckIn(1, owner.address, 1);
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await dracarys.claimCompletionReward(1);
    const receipt = await tx.wait();
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const balanceAfter = await ethers.provider.getBalance(owner.address);

    expect(balanceAfter - balanceBefore + gasCost).to.equal(DAILY_STAKE);
  });

  async function skipDays(days) {
    await ethers.provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
  }

  it("Should move a loser's missed-day stake to the winner exactly once", async function () {
    await dracarys.igniteStreak("Two-Day Challenge", DAILY_STAKE, 2, { value: DAILY_STAKE * 2n });
    await dracarys.connect(friend1).joinStreak(1, { value: DAILY_STAKE * 2n });

    // Owner shows up on day 1, friend1 (the loser) does not.
    await dracarys.submitProof(1, "ipfs://day1");
    await dracarys.connect(friend1).approveCheckIn(1, owner.address, 1);
    await skipDays(1);

    const before = await ethers.provider.getBalance(owner.address);
    await expect(dracarys.connect(friend2).burnSlacker(1, friend1.address, 1))
      .to.emit(dracarys, "StakeBurned")
      .withArgs(1, friend1.address, 1, DAILY_STAKE);
    expect((await ethers.provider.getBalance(owner.address)) - before).to.equal(DAILY_STAKE);
    expect((await dracarys.participants(1, friend1.address)).isBurned).to.equal(true);

    // The same missed day cannot be burned again to drain the pool.
    await expect(dracarys.burnSlacker(1, friend1.address, 1)).to.be.revertedWith(
      "Dracarys: Day already settled"
    );
    // Days outside the streak cannot be burned either.
    await expect(dracarys.burnSlacker(1, friend1.address, 0)).to.be.revertedWith(
      "Dracarys: Invalid day"
    );
  });

  it("Should not burn a day where the member submitted proof", async function () {
    await dracarys.igniteStreak("Two-Day Challenge", DAILY_STAKE, 2, { value: DAILY_STAKE * 2n });
    await dracarys.connect(friend1).joinStreak(1, { value: DAILY_STAKE * 2n });

    await dracarys.connect(friend1).submitProof(1, "ipfs://pending");
    await skipDays(1);
    await expect(dracarys.burnSlacker(1, friend1.address, 1)).to.be.revertedWith(
      "Dracarys: Proof was submitted"
    );
  });

  it("Should give the winner the loser's remaining stake at completion", async function () {
    await dracarys.igniteStreak("Two-Day Challenge", DAILY_STAKE, 2, { value: DAILY_STAKE * 2n });
    await dracarys.connect(friend1).joinStreak(1, { value: DAILY_STAKE * 2n });

    await dracarys.submitProof(1, "ipfs://day1");
    await dracarys.connect(friend1).approveCheckIn(1, owner.address, 1);
    await skipDays(1);
    await dracarys.submitProof(1, "ipfs://day2");
    await dracarys.connect(friend1).approveCheckIn(1, owner.address, 2);
    await skipDays(1);

    // Nobody burned friend1's days, so their full 2-day stake is still in the pool.
    const before = await ethers.provider.getBalance(owner.address);
    const receipt = await (await dracarys.claimCompletionReward(1)).wait();
    const gas = receipt.gasUsed * receipt.gasPrice;
    expect((await ethers.provider.getBalance(owner.address)) - before + gas).to.equal(DAILY_STAKE * 2n);
    expect((await dracarys.streaks(1)).totalPool).to.equal(0);
  });

  it("Should split the pool evenly between multiple winners", async function () {
    await dracarys.igniteStreak("One-Day Challenge", DAILY_STAKE, 1, { value: DAILY_STAKE });
    await dracarys.connect(friend1).joinStreak(1, { value: DAILY_STAKE });
    await dracarys.connect(friend2).joinStreak(1, { value: DAILY_STAKE });

    await dracarys.submitProof(1, "ipfs://a");
    await dracarys.connect(friend1).submitProof(1, "ipfs://b");
    await dracarys.connect(friend2).approveCheckIn(1, owner.address, 1);
    await dracarys.connect(friend2).approveCheckIn(1, friend1.address, 1);
    await skipDays(1);

    // friend2 (the loser) missed the day; both winners get half of that stake.
    await dracarys.claimCompletionReward(1);
    await dracarys.connect(friend1).claimCompletionReward(1);
    expect((await dracarys.getMemberSummary(1, owner.address)).won).to.equal(DAILY_STAKE / 2n);
    expect((await dracarys.getMemberSummary(1, friend1.address)).won).to.equal(DAILY_STAKE / 2n);
    expect((await dracarys.getMemberSummary(1, friend2.address)).lost).to.equal(DAILY_STAKE);
    expect((await dracarys.streaks(1)).totalPool).to.equal(0);
  });
});
