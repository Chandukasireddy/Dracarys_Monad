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
});
