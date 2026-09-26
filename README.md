# Dracarys 🐉🔥 — Social Habit Staking on Monad

> **"Feed the flame every day, or get burned."**  
> Built for the **Monad Blitz Berlin Hackathon** (Saturday, September 26, 2026 at CIC Berlin).

---

## ⚡ The Problem vs. The Monad Solution

* **The Problem:** 95% of people quit daily habits, gym goals, and online courses because virtual badges and fake arcade points (Duolingo gems) carry zero financial stakes. But traditional credit cards charge **$0.30 minimum swipe fees**, making daily €0.10 micro-payouts mathematically impossible on Web2 and Ethereum L1.
* **The Monad Breakthrough:** With **0.3s block times** and **$0.00004 gas fees**, Monad enables **real-money micro-accountability**:
  * Lock **$1.00 – $5.00** into a streak challenge with friends.
  * Every day you check in with proof, you unlock **$0.20 directly back into your wallet in 0.3 seconds**.
  * Slack off and miss a day? Your daily dime is **burned and redistributed to the faithful friends who showed up**.

---

## 🏛️ Smart Contract Architecture (`contracts/DracarysEscrow.sol`)

The autonomous escrow vault lives on **Monad Testnet (Chain ID `10143`)**:

| Function | What It Does on Monad |
| :--- | :--- |
| `igniteStreak(title, dailyStake, totalDays)` | Creator deposits `dailyStake * totalDays` to ignite a new challenge. |
| `joinStreak(streakId)` | Friends join the circle and lock their stake into the shared vault. |
| `submitProof(streakId, proofUri)` | Submits daily proof (gym selfie, step count, or reading URL). |
| `approveCheckIn(streakId, friend, day)` | Friend peer-verifies proof; triggers an **instant 0.3s micro-payout** of `dailyStake` back to the friend! |
| `burnSlacker(streakId, slacker, day)` | Slashes missed daily stake and splits it among the friends who stayed faithful. |

---

## 🌐 Monad Testnet Configuration

* **Network Name:** Monad Testnet
* **Chain ID:** `10143` (`0x279f`)
* **Currency Symbol:** `MON` (18 decimals)
* **Primary RPC:** `https://testnet-rpc.monad.xyz`
* **WebSocket RPC:** `wss://testnet-rpc.monad.xyz`
* **Live Deployed Contract:** [`0x77547711ea2726F16C8BCeDD37a347C139D346E7`](https://testnet.monadvision.com/address/0x77547711ea2726F16C8BCeDD37a347C139D346E7)
* **Deployment Tx:** [`0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f`](https://testnet.monadvision.com/tx/0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f)
* **Frontend Config Export:** [`contracts/export/dracarysContract.ts`](file:///k:/Tech/Hackathon/Dracarys_Monad/contracts/export/dracarysContract.ts)


---

## 👥 3-Person Team Workstreams & Prompts

### Teammate 1: Frontend Lead (`Frontend/`)
* **Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide Icons, Viem, Wagmi, Canvas Confetti.
* **Deliverable:** Mobile-first PWA with dark obsidian theme, Monad purple (`#836EF9`), flame indicators (`🔥`), daily calendar check-in rings, and 1-tap friend approval buttons.

### Teammate 2: Backend Lead (`backend/`)
* **Stack:** FastAPI (Python), Uvicorn, Pydantic, Python-multipart.
* **Deliverable:** Verification engine, proof upload API, metadata hashing, real-time social feed, and 24h deadline/slacker burn evaluation.

### Teammate 3 (You): Monad & Smart Contract Lead (`contracts/`)
* **Stack:** Hardhat, Solidity (`DracarysEscrow.sol`), Monad Testnet deployment, and Vercel GitHub CI/CD orchestration.

---

## 🏆 Hackathon Strategic Intelligence
* **[about_event.md](file:///k:/Tech/Hackathon/Dracarys_Monad/about_event.md)**: Master event brief, rules, judging mechanics, and canonical Monad testnet contracts.
* **[previous_projects.md](file:///k:/Tech/Hackathon/Dracarys_Monad/previous_projects.md)**: Catalog of 84+ historical winners across 50+ Blitz events worldwide.

Group:
Chandrakiran Reddy
Abubakaer
Abdul Jalil