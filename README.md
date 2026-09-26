# Dracarys: Social Habit Staking on Monad

Dracarys helps people build habits with small financial commitments. Create a challenge, check in with proof, and let friends approve each other's progress. The current frontend includes a mock-data demo mode and Monad Testnet wallet configuration.

Built for the Monad Blitz Berlin Hackathon.

Read the complete project documentation in [`docs/README.md`](docs/README.md), or run the frontend and open [`/docs`](http://localhost:3000/docs).

## How To Use The App

1. Open the app and choose **Create a challenge**.
2. Select a habit, choose the challenge duration, and set the daily MON commitment.
3. Submit the challenge. In demo mode, the challenge is saved in your browser.
4. Open an active challenge and choose **Check in**.
5. Add proof, such as a photo or note, and submit it.
6. Use **Friend approvals** to review pending proofs and approve a friend's check-in.
7. Use **My progress** to review completed days, streaks, and milestones.
8. Use **Connect wallet** when you want to connect a wallet to the Monad Testnet flow.

The frontend is responsive. On small screens, use the bottom navigation to switch between streaks, friends, progress, and challenge creation.

## Run The Frontend

Requirements: Node.js 20.9 or newer.

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test the app from a phone on the same Wi-Fi network, open the local network URL printed by Next.js. The development script listens on all network interfaces.

Production checks:

```bash
npm run typecheck
npm run build
npm start
```

Useful frontend scripts:

```bash
npm run test:e2e
npm run format:check
```

## Run The Backend

The backend provides proof upload, verification, social feed, pending approvals, and slacker evaluation APIs.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The API runs at [http://127.0.0.1:8000](http://127.0.0.1:8000). Open the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Run backend tests with:

```bash
python test_api.py
```

## Monad Testnet

| Setting | Value |
| :--- | :--- |
| Network | Monad Testnet |
| Chain ID | `10143` |
| Currency | `MON` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Contract | [`0x77547711ea2726F16C8BCeDD37a347C139D346E7`](https://testnet.monadvision.com/address/0x77547711ea2726F16C8BCeDD37a347C139D346E7) |
| Deployment transaction | [`0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f`](https://testnet.monadvision.com/tx/0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f) |

## Main Features

- Habit challenges with daily MON commitments
- Photo and note proof check-ins
- Friend approval workflow
- Streak calendar and progress tracking
- Wallet connection for Monad Testnet
- Installable, responsive PWA experience
- Local demo persistence through browser storage

## Project Structure

```text
Frontend/   Next.js frontend and PWA
backend/    FastAPI verification and proof API
contracts/  Solidity smart contracts and deployment files
```

Important frontend areas:

- `Frontend/src/app/`: routes, manifest, and global responsive styles
- `Frontend/src/components/`: dashboard, cards, modals, calendar, approvals, and wallet UI
- `Frontend/src/hooks/`: local demo state and contract interaction hooks
- `Frontend/src/lib/`: chain configuration, mock data, types, and contract configuration

## Team

- Chandrakiran Reddy
- Abubaker
- Abdul Jalil.
