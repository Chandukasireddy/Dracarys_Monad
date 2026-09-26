# Dracarys 🐉🔥 — Mobile-First PWA (Monad)

> **Social Habit Staking powered by Monad sub-second finality.**  
> Friends stake real micro-stakes (e.g. 0.05 MON / €0.10) on daily habits. Show up, verify proofs with peer consensus, and stream your money back instantly; miss a cutoff and your stake gets burned and split among your faithful friends.

---

## ⚡ Deployed Smart Contract on Monad Testnet

* **Contract Address:** [`0x77547711ea2726F16C8BCeDD37a347C139D346E7`](https://testnet.monadvision.com/address/0x77547711ea2726F16C8BCeDD37a347C139D346E7)
* **Chain ID:** `10143` (Monad Testnet)
* **RPC URL:** `https://testnet-rpc.monad.xyz`
* **Currency:** MON
* **Block Explorer:** [testnet.monadvision.com](https://testnet.monadvision.com)
* **Deployment Tx:** [`0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f`](https://testnet.monadvision.com/tx/0x3f343b0fd404bca74230852e7f2c0aad4338a8959f42a9bcaa4c5893081c779f)

---

## 🚀 Run Locally

Requires Node.js 20.9+.

```sh
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the local network URL on your phone while connected to the same Wi-Fi. Installability and service workers require HTTPS (or localhost).

```sh
npm run typecheck
npm run build
npm start
```

---

## 📱 Features

- **Kindle Your Flame:** Micro-stake habit commitment with customizable duration (7, 14, 21, 30 days) and daily MON stake.
- **Proof & Check-In:** Photo upload / sample proof preview with celebration sound effects and confetti.
- **Peer Verification Quorum:** Friends review and approve daily check-in proofs.
- **On-Chain Escrow Connection:** Configured via `src/lib/contract.ts` and `src/hooks/use-challenge-contract.ts` targeting `DracarysEscrow.sol`.
- **Installable PWA:** Full offline service worker caching app shell and manifest.

---

## 📁 Project Structure

- `src/app/`: Next.js 16 App Router pages, layout, manifest, responsive styling.
- `src/components/`: Dracarys dashboard shell, flame visualization, habit cards, calendar, approvals, check-in modals, wallet modal, PWA controls.
- `src/hooks/use-streaker.ts` / `use-dracarys.ts`: Persistent habit actions and local state.
- `src/hooks/use-challenge-contract.ts`: Dracarys on-chain escrow interaction hook.
- `src/lib/contract.ts`: Exported contract ABI, address, and chain configuration.
- `public/`: Service worker (`sw.js`), local proof illustrations, install icons.
- `tests/`: End-to-end browser test suites.
