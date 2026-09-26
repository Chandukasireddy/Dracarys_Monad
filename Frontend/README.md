# Streaker ⚡

A mobile-first, interactive frontend for the Monad Blitz Hackathon. Next.js 16 App Router, React, Tailwind CSS 4, Lucide, Wagmi 3, Viem, and canvas-confetti.

## Run locally

Requires Node.js 20.9+.

```sh
cd web
npm install
npm run dev
```

Open http://localhost:3000. Use the local network URL on your phone while connected to the same Wi-Fi. Installability and service workers require HTTPS (or localhost).

```sh
npm run typecheck
npm run build
npm start
```

Deploy the `web/` directory as the project root on any Next.js hosting provider. A production service worker caches the visited app shell and static assets for offline demo use. Wallet RPC requests are never cached. Open the production app online once before testing offline.

## Try the demo

- Check in to a habit with an uploaded image or built-in sample proof. Claiming adds one day and its daily stake to mock progress, plays an optional sound, triggers confetti, and requests haptic feedback when supported.
- Only one claim per habit per local calendar day. Claims stop when a challenge is complete.
- Approve friends directly, or open a proof before approving.
- Create a challenge with a title, category, duration, and micro-stake. An invite code and scannable QR follow.
- Join the seeded demo challenge with **STR-WALK7**. Invites created on this device can be copied, but cross-device resolution needs a backend.
- Desktop: click the bottom-left profile for sound preferences and reset. Mobile: use the profile control in the header.
- Swipe horizontally on a non-interactive part of the page to switch tabs. Swipe the sheet handle down to dismiss a modal. Keyboard users can use Tab, Escape, and the skip link.

State is saved to browser localStorage. Uploaded photos are temporary local previews, not uploaded or stored. Sample proof illustrations are bundled SVGs. USD figures in the original gym challenge are explicitly illustrative; no exchange rate is fetched. All stakes and claims are simulated, even when a wallet is connected.

## Web3 integration boundary

`src/lib/chain.ts` configures Monad Testnet, chain ID **10143**, currency **MON**, RPC **https://testnet-rpc.monad.xyz**. Injected wallets support MetaMask and compatible wallet browsers.

`src/hooks/use-challenge-contract.ts` exports `useChallengeContract()` with `createChallenge`, `joinChallenge`, `checkIn`, and `approveFriend`. It is an **unused future adapter**, not a deployed integration. The included ABI is a proposed interface. Replace it with the actual deployed ABI and confirm argument semantics, deposits, proof storage, approval timing, and claim behavior before wiring it into the UI. `NEXT_PUBLIC_STREAKER_CONTRACT_ADDRESS` alone does not enable live UI writes.

The adapter checks the wallet and chain, estimates gas, simulates the call, submits with the estimated gas limit, waits for a receipt, and rejects reverted receipts. No hardcoded arbitrary gas limit or contract address is used. `tsconfig.json` targets ES2020 for BigInt.

Friend review and instant reward claims are separate demo interactions. A real protocol must define when approval is required before releasing a stake. This frontend does not enforce an undeclared contract policy.

## Structure

- `src/app/`: App Router page, layout, manifest, responsive styling.
- `src/components/`: dashboard shell, habit cards, calendar, approvals, check-in/create/join/wallet sheets, PWA controls.
- `src/hooks/use-streaker.ts`: persistent mock actions.
- `src/hooks/use-challenge-contract.ts`: future contract adapter.
- `src/lib/`: mock fixtures, data types, chain, celebration effects.
- `public/`: service worker, local proof illustrations, install icons.
- `tests/`: browser checks for core user flows.

No backend, smart contract, proof verification service, push notification service, or deployment is included.

## Browser checks

With Google Chrome installed locally:

```sh
npm run build
npm run test:e2e
```

The suite starts its own production server on port 3100 and covers desktop/mobile claims, validation, creation and QR rendering, demo joining, approval history, persistence, wallet-unavailable errors, responsive overflow, and offline app-shell loading. No real wallet transaction is sent. Use `npm run format:check` to verify source formatting.
