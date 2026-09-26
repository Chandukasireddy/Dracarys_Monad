<div align="center">
  <h1>🐉 Dracarys Documentation</h1>
  <p><b>Comprehensive Guide & Technical Specifications for Dracarys on Monad</b></p>

  <br />

  <img src="../screenshots/image.png" alt="Dracarys Application Visual Preview" width="95%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />

  <br />
  <br />
</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Monad Smart Contract Escrow](#-monad-smart-contract-escrow)
- [How To Use The Application](#-how-to-use-the-application)
- [Frontend Guide](#-frontend-guide)
- [Backend Guide](#-backend-guide)
- [Monad Testnet Configuration](#-monad-testnet-configuration)
- [Project Directory Structure](#-project-directory-structure)
- [Team](#-team)

---

## 🌟 Overview

**Dracarys (Streaker)** is a decentralized social habit-staking application built on the **Monad Blockchain**. It enforces habit consistency by requiring users to stake MON tokens daily. 

- **Sub-Second Execution**: Payouts take advantage of Monad's 0.3s block times.
- **Peer Accountability**: Friends approve each other's check-in proof photos/notes before payouts are triggered.
- **Slacker Slasher**: Missed days result in staked MON being burned or redistributed to faithful friends.

---

## 🏗️ System Architecture

<div align="center">

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                  │
│   Next.js 14 Web App / Progressive Web App (PWA)                      │
│   Wagmi + Viem Injected MetaMask / Monad Wallet Connector               │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│          BACKEND API                  │  │     BLOCKCHAIN LAYER        │
│  FastAPI (Python)                     │  │  Monad Testnet (Chain 10143)│
│  Neon PostgreSQL                      │  │  DracarysEscrow.sol         │
│  User Accounts, Invites & Activity    │  │  Escrow Vault & Payouts     │
└───────────────────────────────────────┘  └─────────────────────────────┘
```

</div>

---

## 📜 Monad Smart Contract Escrow

The core smart contract logic resides in `contracts/DracarysEscrow.sol`.

### Core Contract Functions

| Function | Access | Description |
| :--- | :--- | :--- |
| `igniteStreak(title, dailyStake, totalDays)` | Public Payable | Starts a new streak and locks total stake (`dailyStake * totalDays`) into the contract escrow vault. |
| `joinStreak(streakId)` | Public Payable | Allows a friend to join an existing streak by locking an identical total stake into the pool. |
| `submitProof(streakId, proofUri)` | Participant | Submits daily check-in proof (IPFS hash, image URL, or note). Auto-verifies if solo streak. |
| `approveCheckIn(streakId, friend, day)` | Participant | Peer approval function. Triggers instant sub-second payout of daily stake to friend. |
| `burnSlacker(streakId, slacker, day)` | Public | Slashes a missed check-in after 24h and distributes the slacker's daily stake to active members. |
| `claimCompletionReward(streakId)` | Participant | Claims remaining pool share upon completing the full streak duration. |

---

## 🎮 How To Use The Application

<ol>
  <li><strong>Connect Wallet / Login</strong>: Sign in or connect MetaMask set to Monad Testnet (Chain ID <code>10143</code>).</li>
  <li><strong>Create Challenge</strong>: Define habit name, duration (7, 14, 21, 30 days), and daily MON micro-stake.</li>
  <li><strong>Invite Buddies</strong>: Share your challenge invite code or send direct in-app invitations.</li>
  <li><strong>Daily Check-in</strong>: Upload photo or text proof of daily habit completion.</li>
  <li><strong>Approve Friends</strong>: Review pending friend check-ins under the <strong>Friend Approvals</strong> tab.</li>
  <li><strong>Track Progress</strong>: Monitor your completed days, active commitments, and earned rewards in <strong>My Progress</strong>.</li>
</ol>

---

## 💻 Frontend Guide

Requirements: **Node.js 20.9+**

```bash
cd Frontend
npm install
npm run dev
```

The application will be served at `http://localhost:3000`.

### Helper Scripts

```bash
npm run typecheck    # Run TypeScript compiler verification
npm run build        # Build Next.js production bundle
npm run test:e2e     # Run End-to-End browser tests
```

---

## 🐍 Backend Guide

The FastAPI backend handles user accounts, in-app notifications, and streak invite tracking.

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

## ⚡ Monad Testnet Configuration

| Setting | Value |
| :--- | :--- |
| **Network** | Monad Testnet |
| **Chain ID** | `10143` |
| **Native Token** | `MON` |
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Contract Address** | `0x77547711ea2726F16C8BCeDD37a347C139D346E7` |
| **Block Explorer** | [Monad Vision Explorer](https://testnet.monadvision.com) |

---

## 📁 Project Directory Structure

```text
Dracarys_Monad/
├── Frontend/                 # Next.js 14 App Router, Viem, Wagmi, UI components
│   ├── src/app/              # Application pages, API proxies & layout
│   ├── src/components/       # Modals, habit cards, calendar & approval UI
│   ├── src/hooks/            # Contract & state management hooks
│   └── src/lib/              # Contract ABI, types & chain config
├── backend/                  # FastAPI service (Python)
│   ├── main.py               # API endpoints & database models
│   └── requirements.txt      # Python dependencies
├── contracts/                # Hardhat environment & Solidity smart contracts
│   ├── DracarysEscrow.sol    # Monad habit staking escrow contract
│   ├── test/                 # Contract unit & money flow test suites
│   └── scripts/              # Contract deployment scripts
├── screenshots/              # Application interface preview assets
└── docs/                     # Project documentation
```

---

## 👥 Team

- **Chandrakiran Reddy**
- **Abubaker**
- **Abdul Jalil**
