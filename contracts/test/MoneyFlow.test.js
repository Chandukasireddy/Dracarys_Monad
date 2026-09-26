const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tracks wallet balances the way MetaMask shows them: gas is paid by whoever sends a tx.
describe("DracarysEscrow money flow: loser pays, winner receives", function () {
  const STAKE = ethers.parseEther("0.1"); // 0.1 MON per day
  const DAYS = 3;
  const DEPOSIT = STAKE * BigInt(DAYS);

  let dracarys, winner, loser;
  const gasSpent = new Map();

  async function send(signer, txPromise) {
    const receipt = await (await txPromise).wait();
    const fee = receipt.gasUsed * receipt.gasPrice;
    gasSpent.set(signer.address, (gasSpent.get(signer.address) ?? 0n) + fee);
    return receipt;
  }
  async function nextDay() {
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
  }
  // Balance change excluding gas, i.e. only the MON that actually moved.
  async function moved(signer, start) {
    const now = await ethers.provider.getBalance(signer.address);
    return now - start + (gasSpent.get(signer.address) ?? 0n);
  }

  beforeEach(async function () {
    [winner, loser] = await ethers.getSigners();
    dracarys = await (await ethers.getContractFactory("DracarysEscrow")).deploy();
    gasSpent.clear();
  });

  it("loser loses their whole stake, winner gets it at the end", async function () {
    const winnerStart = await ethers.provider.getBalance(winner.address);
    const loserStart = await ethers.provider.getBalance(loser.address);

    await send(winner, dracarys.connect(winner).igniteStreak("Gym", STAKE, DAYS, { value: DEPOSIT }));
    await send(loser, dracarys.connect(loser).joinStreak(1, { value: DEPOSIT }));
    expect(await moved(loser, loserStart)).to.equal(-DEPOSIT); // outgoing from loser's wallet

    // Winner checks in every day; loser never does.
    for (let day = 1; day <= DAYS; day++) {
      await send(winner, dracarys.connect(winner).submitProof(1, `ipfs://day${day}`));
      await send(loser, dracarys.connect(loser).approveCheckIn(1, winner.address, day));
      await nextDay();
    }
    await send(winner, dracarys.connect(winner).claimCompletionReward(1));

    console.log("      winner net:", ethers.formatEther(await moved(winner, winnerStart)), "MON (+ gas)");
    console.log("      loser  net:", ethers.formatEther(await moved(loser, loserStart)), "MON (+ gas)");
    expect(await moved(winner, winnerStart)).to.equal(DEPOSIT); // winner gains the loser's stake
    expect(await moved(loser, loserStart)).to.equal(-DEPOSIT); // loser's stake is gone
    expect(await ethers.provider.getBalance(await dracarys.getAddress())).to.equal(0n);
  });

  it("burning a missed day moves that day's stake from loser to winner immediately", async function () {
    await send(winner, dracarys.connect(winner).igniteStreak("Gym", STAKE, DAYS, { value: DEPOSIT }));
    await send(loser, dracarys.connect(loser).joinStreak(1, { value: DEPOSIT }));
    await nextDay(); // loser missed day 1

    const winnerBefore = await ethers.provider.getBalance(winner.address);
    gasSpent.clear();
    await send(winner, dracarys.connect(winner).burnSlacker(1, loser.address, 1));
    expect(await moved(winner, winnerBefore)).to.equal(STAKE);
  });

  it("if both finish, nobody loses: each gets their full stake back", async function () {
    const winnerStart = await ethers.provider.getBalance(winner.address);
    const loserStart = await ethers.provider.getBalance(loser.address);
    await send(winner, dracarys.connect(winner).igniteStreak("Gym", STAKE, DAYS, { value: DEPOSIT }));
    await send(loser, dracarys.connect(loser).joinStreak(1, { value: DEPOSIT }));
    for (let day = 1; day <= DAYS; day++) {
      await send(winner, dracarys.connect(winner).submitProof(1, `ipfs://a${day}`));
      await send(loser, dracarys.connect(loser).submitProof(1, `ipfs://b${day}`));
      await send(loser, dracarys.connect(loser).approveCheckIn(1, winner.address, day));
      await send(winner, dracarys.connect(winner).approveCheckIn(1, loser.address, day));
      await nextDay();
    }
    expect(await moved(winner, winnerStart)).to.equal(0n);
    expect(await moved(loser, loserStart)).to.equal(0n);
  });
});
