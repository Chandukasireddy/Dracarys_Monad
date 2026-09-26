# Dracarys Documentation

Dracarys is a social habit-staking application built for Monad. Users create habit challenges, commit small MON stakes, submit proof, and approve progress with friends.

## Documentation Map

- [How to use the app](#how-to-use-the-app)
- [Run the frontend](#run-the-frontend)
- [Run the backend](#run-the-backend)
- [Architecture](#architecture)
- [Monad Testnet](#monad-testnet)
- [Project structure](#project-structure)

## How to Use the App

1. Open the frontend and choose **Create a challenge**.
2. Name the habit, select an energy type, choose a duration, and continue.
3. Set the daily MON commitment and create the challenge.
4. Open an active challenge and submit a check-in with proof.
5. Open **Friend approvals** to review pending proofs.
6. Open **My progress** to review streaks, check-ins, and milestones.
7. Use **Connect wallet** for the Monad Testnet wallet flow.

The demo stores local progress in browser storage. This lets the interface be tested before the full smart-contract flow is connected.

## Run the Frontend

Requirements: Node.js 20.9 or newer.

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run typecheck
npm run build
npm start
npm run test:e2e
```

The frontend listens on all network interfaces, so the local network URL can be opened on a phone connected to the same Wi-Fi network.

## Run the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The API is available at `http://127.0.0.1:8000` and the interactive documentation is at `http://127.0.0.1:8000/docs`.

Run backend tests with:

```bash
python test_api.py
```

## Architecture

### Frontend

The Next.js App Router frontend contains the responsive dashboard, challenge creation flow, check-in flow, friend approvals, progress views, wallet modal, and PWA controls.

### Backend

The FastAPI service handles proof uploads, verification, pending approvals, activity feeds, and deadline evaluation.

### Contracts

The Solidity contracts contain the escrow logic for creating streaks, joining challenges, submitting proof, approving check-ins, and burning missed commitments.

## Monad Testnet

| Setting | Value |
| :--- | :--- |
| Network | Monad Testnet |
| Chain ID | `10143` |
| Currency | `MON` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Contract | `0x77547711ea2726F16C8BCeDD37a347C139D346E7` |

## Project Structure

```text
Frontend/   Next.js frontend and PWA
backend/    FastAPI verification and proof API
contracts/  Solidity smart contracts and deployment files
docs/       Project documentation
```

Important frontend areas:

- `Frontend/src/app/`: routes, metadata, manifest, and responsive styles
- `Frontend/src/components/`: dashboard, cards, modals, approvals, and wallet UI
- `Frontend/src/hooks/`: local state and contract interaction hooks
- `Frontend/src/lib/`: chain configuration, types, mock data, and contract data

## Team

- Chandrakiran Reddy
- Abubaker
- Abdul Jalil
