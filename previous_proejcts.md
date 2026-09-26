# Monad Blitz Hackathon — Master Hall of Winners & Project Intelligence

> **Comprehensive reference database of all winning projects across 50+ Monad Blitz Hackathons globally.**
> *Source: Direct scrape from `https://blitz.devnads.com/api/showcase?winners=true` & Blitz Showcase.*

---

## 🏆 Strategic Cheat Sheet: Why These Projects Won

Analyzing all 80+ winning submissions reveals the **three common patterns** that consistently win at Monad Blitz:
1. **Exploiting Monad-Native Capabilities:** They don't just build a standard EVM clone. Winners build things that are **unfeasible on Ethereum L1** — e.g. per-second streaming payments, zero-gas x402 agent micropayments, simultaneous room-wide multiplayer battles, or 128KB monolithic smart contracts.
2. **Instant Demoability (The 3-Minute Rule):** Winners state the problem in one sentence, then show a live functioning build on a public URL immediately. No theoretical slides.
3. **Agentic Interaction (The 2026 Meta):** AI agents that can own wallets, pay for services programmatically with `@monad-crypto/mpp` or x402, and make autonomous financial decisions on Monad testnet have the highest winning conversion rate.

---

## 🚀 AI & Autonomous Agents / x402 Micropayments (69 Winning Projects)

### 🥇 1st Place: **Meterrail**
- **Event:** Blitz Abuja | **Category:** `Infra`
- **Builders:** Abduljalal Mohammed, Muobonuvie Tone, Oiseh Omokheoa
- **Core Mechanic & Idea:** Meterrail What it is Meterrail is agent-native payment infrastructure on Monad — two complementary payment primitives that let AI agents pay for APIs, compute, and data the way each actually needs to be billed: per call, or continuously by the second.  What it does Discrete metering. Wraps Monad's live, hosted x402 facilitator: an agent authorizes a maximum per call, the facilitator settles only the measured usage on-chain — sub-cent, sub-second, no API key or subscription. Continuous streaming. Adds Stream.sol, a from-scratch contract for the one billing shape x402 doesn't cover: a consumer deposits once against a fixed per-second rate, a provider's claimable balance accrues continuously (capped at the deposit), either side can top up or cancel — and cancelling freezes what's already earned while refunding the rest instantly. A working reference app around both, not just contracts: a metered inference gateway, a live two-lane dashboard that visualizes discrete vs. continuous settlement side by side in real time, autonomous CLI agents that drive both payment modes end-to-end (agent:metered, agent:loop), and an optional ERC-8004-style agent identity registry. What makes it special It fills a real gap instead of re-solving a solved problem. x402 already handles discrete, per-call settlement well — rebuilding that would just be redundant infrastructure. The actual contribution is the primitive x402 doesn't have: a trust-minimized way to bill something with no natural "per call" shape — a live inference session, a rented GPU, a data feed, a sub-agent working an open-ended task. The differentiator is visible, not just claimed. The dashboard puts a step-function balance draining per call next to a smoothly, continuously rising claimable balance, live, on one screen — that contrast is the pitch. It's specifically a Monad story, not a portable one. Sub-second finality is what makes a live streaming balance actually trustworthy to poll in real time; Monad's hosted facilitator means the discrete half needs zero payment infrastructure of its own to run. This wouldn't feel the same on a chain with multi-second finality. The safety properties are demonstrated, not asserted. 24 passing tests cover the edge cases that matter for money-handling code — deposit exhaustion, double-withdrawal, cancel-then-refund correctness, access control. The dashboard even forces a real authorization-exceeded rejection on demand — the actual protocol actually refuses to overcharge, live, not a simulated failure state. Smart contracts Both live and already in active use on Monad Testnet (chain id 10143) — not just deployed, but genuinely called (their current counters, nextStreamId: 8 and nextAgentId: 1, reflect real transactions, not a fresh deployment):  Contract	Address	What it does Stream	0x3D862fE4Af9bc36a8f34aCC37d6E899D75818d13	The continuous payment primitive — openStream / balanceOf / withdraw / topUp / cancel. 14 passing tests covering accrual math, deposit exhaustion, double-withdrawal, and cancel-refund correctness. IdentityRegistry	0x0998ec96097aD2908Af40708d3f6635FA5b2e145	A minimal, self-deployed ERC-8004-style agent identity registry — each agent is an ERC-721 token with an off-chain agent card, on-chain metadata, and an optional operating wallet. 10 passing tests. Both deployed via Hardhat Ignition and viewable at testnet.monadexplorer.com/address/<address>.
- **Links:** [🌐 Live Demo](https://github.com/jalal-codr/Meterrail) · [💻 GitHub Repository](https://github.com/jalal-codr/Meterrail)

### 🥇 1st Place: **Troia**
- **Event:** Blitz Çanakkale | **Category:** `DeFi/Payment`
- **Builders:** omermetehanizal@gmail.com
- **Core Mechanic & Idea:** Troia is a payment orchestration system that enables Troy card users to make crypto payments directly with Turkish Lira without opening a wallet by combining virtual POS, AI arbitrage, and smart contract technology.​​​​​​​​​​​​​​​​
- **Links:** [🌐 Live Demo](http://172.30.48.60:3000) · [💻 GitHub Repository](https://github.com/Foreveranka/Troia) · [🐦 Video / Tweet](https://x.com/0xmetee/status/2055646751978107326?s=20)

### 🥇 1st Place: **WICK**
- **Event:** Monad Blitz Ankara | **Category:** `DeFi-Ai`
- **Builders:** Furkan Yesildag
- **Core Mechanic & Idea:** WICK is an autonomous AI market maker on Monad. On Uniswap, bots catch the real price before the pool updates and skim LPs every block  a $230M+ leak called LVR (Loss-Versus-Rebalancing). WICK puts an AI agent in charge of the liquidity: it reads the live MON/USD price from Pyth, decides the spread every block, and reprices the pool on-chain as a Uniswap v4 hook —so arbitrageurs have nothing to skim and LPs earn the spread instead. Anyone can deposit native MON from their wallet. A live side-by-side shows a passive Uniswap pool bleeding to bots while WICK earns. Per-block, AI-driven market-making is only possible on Monad's 400ms blocks + parallel execution. Real Pyth price, real AI, real on-chain, verified contracts.
- **Links:** [🌐 Live Demo](https://wick-monad.vercel.app) · [💻 GitHub Repository](https://github.com/furkanyesildag/wick-monad)

### 🥇 1st Place: **DinnerNode**
- **Event:** Monad Blitz Belgrade | **Category:** `AI`
- **Builders:** yaros3920@gmail.com
- **Core Mechanic & Idea:** DinnerNode turns idle consumer GPUs into a marketplace for LLM inference with per-second micropayments on Monad. A provider daemon registers its hardware + local model on-chain; a guest deposits MON into per-job escrow; the provider streams tokens and settles every ~2s — ~30 real transactions per answer, ≈$100+ of gas on Ethereum, fractions of a cent on Monad. Trust = post-pay per second (guest risk: one settlement; escrow auto-closes). Privacy = prompts exist on-chain only as keccak commitments bound to Semaphore pseudonyms, with Groth16 proofs generated & verified in the guest's browser. Anyone can open the demo, get auto-funded, place a one-tap order, and watch a real RTX 5070 Ti laptop (or the hosted cloud kitchen) answer while the receipt ticks; if a host dies mid-answer the guest auto-fails-over to another provider. Built with monskills. Every token is a tip.
- **Links:** [🌐 Live Demo](https://web-opal-sigma-55.vercel.app/) · [💻 GitHub Repository](https://github.com/yarosthenerd/dinner-node)

### 🥇 1st Place: **Monad IDE**
- **Event:** Monad Blitz Bhopal | **Category:** `Dev tooling`
- **Builders:** Adwait Keshari
- **Core Mechanic & Idea:** MonadStudio - Smart Contract IDE for Monad Network  MonadStudio is the first browser-based IDE built specifically for Monad's parallel execution architecture. Developers write and deploy smart contracts while getting real-time analysis of how their code will perform on Monad's 10,000 TPS infrastructure.  The core innovation is the Parallel Execution Profiler - a tool that analyzes storage dependencies, detects execution conflicts, and provides a parallelization score (0-100) with specific optimization recommendations. This helps developers unlock Monad's full performance potential instead of treating it like sequential Ethereum.  Built with Next.js 16, Monaco Editor, and Hardhat 2.27+. Includes security scanning, multi-file support, OpenAI integration, and one-click deployment to Monad Testnet. 74 files, 32,000+ lines of production code, 45/45 tests passing.  Live demo: monad-jet.vercel.app GitHub: https://github.com/Adwaitbytes/monad-blitz-bhopal/tree/hackathon-submission  Perfect for DeFi protocols migrating to Monad, new projects building on the network, and developers learning parallel execution optimization.
- **Links:** [🌐 Live Demo](https://monad-jet.vercel.app/) · [💻 GitHub Repository](https://github.com/Adwaitbytes/monad-blitz-bhopal/tree/hackathon-submission)

### 🥇 1st Place: **Mojoman**
- **Event:** Monad Blitz Denver 2026 | **Category:** `Fitness, Monad`
- **Builders:** Anthony Kobzar, Ezra Tramble
- **Core Mechanic & Idea:** MojoMan incentivizes fitness at hackathons through letting users bet on other user's exercise and track how many reps the user does. AI pose detection counts reps in real-time via webcam. All sessions are live streamed via WebRTC and stored on Monad, utilizing Monad's high throughput for instant session creation, betting, and resolution.
- **Links:** [🌐 Live Demo](https://mojoman.vercel.app) · [💻 GitHub Repository](https://github.com/eztramble123/mojo)

### 🥇 1st Place: **PassChick**
- **Event:** Monad Blitz Jogja | **Category:** `GameFi`
- **Builders:** diaz, Faaid Sakhaa, Wangsit Nursyahada
- **Core Mechanic & Idea:** Pass Chick is a wallet-based arcade game on Monad testnet where players deposit mock USDC, start onchain game sessions, and cash out through backend-authoritative settlement. It combines a Next.js frontend, an Express + Socket.io backend, and upgradeable smart contracts for vault, settlement, faucet, and trust passport flows.
- **Links:** [🌐 Live Demo](https://pass-chick.vercel.app) · [💻 GitHub Repository](https://github.com/wngstnr-code/pass-chick) · [🐦 Video / Tweet](https://x.com/azzgjlss/status/2047995796772335958?s=46)

### 🥇 1st Place: **Ravasend**
- **Event:** Monad Blitz Lagos | **Category:** `Remittance`
- **Builders:** isikaemmanuel@gmail.com
- **Core Mechanic & Idea:** Send money across Africain minutes. Pay with crypto on Monad. Deliver local value in NGN, GHS, XOF, or XAF — instantly, securely, transparently.
- **Links:** [🌐 Live Demo](http://ravasend-c4as.vercel.app/) · [💻 GitHub Repository](https://github.com/openreva/Ravasend) · [🐦 Video / Tweet](https://x.com/ravasend/status/2042987308735959371)

### 🥇 1st Place: **Vertex**
- **Event:** Monad Blitz Medellin | **Category:** `SDK`
- **Builders:** Juan José duque, juan pablo serna arboleda, cristian yesid mesa giraldo, Alejandro Murillo Zapata
- **Core Mechanic & Idea:** Vertex es una infraestructura de benchmark de alto rendimiento para Monad, diseñada para resolver los conflictos de acceso al almacenamiento compartido (OCC) que limitan la escalabilidad de dApps convencionales. A través de un motor de enjambre que orquesta transacciones concurrentes, el proyecto compara una arquitectura de almacenamiento global frente a un modelo de particionamiento por canales disjuntos.  Este sistema ofrece observabilidad en tiempo real sobre TPS y errores, demostrando cómo una arquitectura nativa de ejecución paralela es crucial para evitar cuellos de botella críticos. Así, Vertex establece un estándar esencial para que los desarrolladores validen, cuantifiquen y optimicen la resiliencia de sus protocolos antes del lanzamiento en mainnet.
- **Links:** [🌐 Live Demo](https://www.youtube.com/watch?v=pZEDqzx0voI) · [💻 GitHub Repository](https://github.com/teamlocknet/Vertex) · [🐦 Video / Tweet](https://x.com/DuqueSec/status/2063401436138856906)

### 🥇 1st Place: **Cryptobazaar**
- **Event:** Monad Blitz Mumbai | **Category:** `DeFi`
- **Builders:** Sachhidananda Mahapatro, Dhairya Shukla
- **Core Mechanic & Idea:** CryptoBazaar is a peer-to-peer cryptocurrency trading platform built with Next.js, supporting multiple blockchains (Polygon Amoy and Monad Testnet) for seamless USDC, USDT, and MON trading. The platform includes Razorpay payment integration and Clerk authentication for secure transactions.  ## Features  - 🔒 **Escrow Protection** - Every trade secured by automated escrow system - 🌉 **Multi-Chain Support** - Trade on both Polygon Amoy and Monad Testnet - ⚡ **Instant Settlements** - Complete trades in minutes with UPI/GPay - 👥 **Verified Users** - Comprehensive KYC verification process - 📈 **Best Rates** - Competitive exchange rates with real-time market data - 🌐 **24/7 Trading** - Round-the-clock availability with customer support - 💳 **Multiple Payment Options** - UPI, GPay, PhonePe support ## Multi-Chain Support  CryptoBazaar supports trading on multiple blockchains:  - **Polygon Amoy Testnet**: Trade USDC and USDT with fast, low-cost transactions. - **Monad Testnet**: Trade MON tokens natively on Monad's EVM-compatible testnet.  When creating a listing, users can select which chain to use for their trade. The escrow system is deployed on both networks, ensuring secure and flexible trading across chains.
- **Links:** [🌐 Live Demo](https://monad-blitz-mumbai-5m4x.vercel.app/) · [💻 GitHub Repository](https://github.com/Sachin1785/monad-blitz-mumbai)

### 🥇 1st Place: **pin🤏h**
- **Event:** Monad Blitz NYC | **Category:** `Agentic Payments`
- **Builders:** Muhammad Waseem Thameem, Captain Code, Jenil Panchal
- **Core Mechanic & Idea:** Pinch: A WebXR Hand Tracking for Snap Spectacles. We have real-time hand tracking in the Snap Spectacles browser, streamed to any device via a Cloudflare relay. No app install. No pairing. Just open a URL.
- **Links:** [🌐 Live Demo](https://ui-orpin-xi.vercel.app/) · [💻 GitHub Repository](https://github.com/waseem091/pinch)

### 🥇 1st Place: **Universal Arc Kit**
- **Event:** Monad Blitz Nagpur | **Category:** `Infrastructure`
- **Builders:** Prathamesh Mutkure
- **Core Mechanic & Idea:** ## 🎯 What is Universal App Kit?  Universal App Kit is a **cross-chain intent forwarding system** that solves the biggest friction point in multi-chain applications: **network switching and bridging**.  ### The Problem - Users must switch networks in their wallet - Users need to bridge funds to destination chains - Complex UX with multiple transaction confirmations - High gas costs on multiple chains  ### The Solution - ✅ **No Network Switching** - Users stay on their preferred chain - ✅ **No Bridging Required** - Gateway handles intent forwarding - ✅ **Any Wallet** - MetaMask, Phantom, Coinbase Wallet, etc. - ✅ **Normal Solidity** - Write contracts as usual, no special logic needed - ✅ **Universal Monad Account** - One smart account on Monad for all external wallets  ---
- **Links:** [🌐 Live Demo](https://universal-arc-kit.vercel.app) · [💻 GitHub Repository](https://github.com/prathamesh-mutkure/universal-arc-kit)

### 🥇 1st Place: **AgMON**
- **Event:** Monad Blitz New Delhi | **Category:** `Automated defi`
- **Builders:** Pulkit Saraf, Mohit Goyal, Mayank Singh
- **Core Mechanic & Idea:** AgMON is a non-custodial portfolio automation platform that transforms manual crypto management into intelligent, self-executing strategies. Using AI-powered natural language processing and a visual drag-and-drop canvas, users define automated trading rules like rebalancing, profit-taking, and dollar-cost averaging. Built on MetaMask DeleGator smart accounts, AgMON's bot monitors and executes strategies 24/7 while users retain complete fund control through revocable delegations. Integrated with Pyth Oracle for real-time pricing and Uniswap/Monorail for decentralized swaps, the platform eliminates custodial risk while enabling sophisticated portfolio automation. No coding required—just describe your strategy and let AgMON handle execution.
- **Links:** [🌐 Live Demo](https://github.com/Pulkit7070/monad-blitz-delhi) · [💻 GitHub Repository](https://github.com/Pulkit7070/monad-blitz-delhi)

### 🥇 1st Place: **Orbital**
- **Event:** Monad Blitz Online: Student Founder Fellowship Edition | **Category:** `Defi`
- **Builders:** Ajay
- **Core Mechanic & Idea:** a spherical AMM which supports multi-token pools like Curve and provides the concentrated liquidity of Uniswap v3, both at once, which no pool in production does today. It is an implementation of Orbital, the AMM paper published by Paradigm, shipped as a Uniswap v4 hook and deployed on Monad testnet. Four stablecoins share one reserve book inside the hook, which prices them on a sphere rather than on Uniswap's constant-product curve, so a whole basket of dollars trades against a single deep pool.   PROBLEM   Stablecoins all target the same dollar, but every AMM in production makes you choose between holding many of them and holding them deeply.  Curve takes the first path. It keeps a whole basket in one pool, but lays liquidity flat along the entire curve, so most of the capital ends up parked at prices a dollar will never reach while the peg, where stablecoins actually trade, stays thin. In practice that works out to roughly one to two times the capital efficiency of a flat curve.  Uniswap v3 takes the second path. It concentrates liquidity exactly where trades land, which is far more efficient, and then caps the pool at two tokens. Because every pool is a pair, a four-coin basket has to fragment into six separate markets, each shallower than the last, and liquidity sitting in USDC/USDT does nothing for someone trading USDC against FRAX.  The deeper problem is what happens when a coin fails. A flat stable pool goes on quoting a broken asset near a dollar long after the market has repriced it, so arbitrage sells the failing coin in and takes the healthy ones out until the LPs are left holding almost nothing else. That is the tail impermanent loss which wiped out stable LPs when USDC fell to eighty-eight cents in March 2023, and it is a direct consequence of the pool having no way to express a limit on what it is willing to hold.   SOLUTION  All three problems come from the same place, which is the shape of the curve, so Orbital changes the shape. Where Uniswap prices two tokens on a hyperbola, x times y equals k, Orbital prices N tokens on a sphere, where the squared distance from the reserve vector to the centre equals the radius squared.  The sphere. The pool's reserve vector is a point on an N-dimensional sphere of radius r centred at (r, ..., r). The peg is the equal-price point, where every coin trades exactly one to one. The curve is almost flat there and only begins to bend as the basket drifts away from the peg, which is precisely the behaviour you want from a stablecoin venue.  The ticks. Each LP cuts that sphere with a plane of their own, set at whatever depeg they are willing to hold, for example "provide liquidity only while this coin stays above ninety-five cents". Capital then packs into the narrow band around the peg instead of being smeared across prices that never occur, and because the curve below the bound is removed, a modest real deposit behaves like a far larger reserve. This is the same virtual-liquidity idea behind Uniswap v3, generalised from a pair to an N-sphere.  The torus. Every one of those planes stacks into a single torus that the pool tracks with just two running sums, the sum of the reserves and the sum of their squares, so a swap costs the same whether the basket holds four coins or forty.  That same plane is also what makes a depeg survivable. When a coin crosses the bound an LP chose, their tick moves to the boundary and stops quoting, so the pool stops absorbing the failing asset while every healthy coin keeps trading one to one against the others. Nothing has to be voted on and nothing has to be paused. The isolation is a property of where the plane sits on the sphere, so it happens the moment the bound is crossed, and each LP's downside is capped at the limit they set when they deposited.   WHAT IT PROVIDES  - Multi-token pools, not pairs. A single pool prices a whole basket off one sphere. Four stablecoins would normally need six separate markets; here the six pairs are only views onto one shared reserve vector, and listing a fifth coin adds a dimension rather than four more markets.  - No liquidity fragmentation. Because the pairs share one book, a USDC/FRAX trade draws on exactly the same liquidity as USDC/USDT. One deep pool instead of six thin ones.  - Concentrated liquidity in N dimensions. Each LP sets their own depeg bound, so capital sits in the narrow band around the peg where stablecoins actually trade instead of being spread across prices that never happen.  - Higher capital efficiency. A tick removes the curve below its bound, so a small real deposit behaves like a much larger reserve. Measured at about 154 times a flat curve on the live deployment.  - Lower slippage. A hundred-thousand-dollar swap moves the price 0.0145 percent, of which the 1 basis point pool fee is most of it, leaving under half a basis point of true price impact.  - Automatic depeg isolation. When a coin breaks peg its tick exits to the boundary and the rest keep trading one to one, so a single broken coin cannot drain the LPs who supplied the others. Loss is bounded by the plane the LP chose.  - Constant-time swaps. Interior and boundary ticks consolidate into one torus invariant, so a swap stays O(1) no matter how many assets or ticks the pool holds.  - Built on v4, not beside it. The hook supplies only the curve. Custody, flash accounting and the unlock and settle flow are all v4's, so any router or aggregator that already speaks v4 can trade against it. Tokens never leave the PoolManager and the hook settles entirely in ERC-6909 claim tokens.   MEASURED ON THE LIVE DEPLOYMENT  Quoted through the V4Quoter against the deployed hook, on roughly 20 million dollars of capital, a 10,000 dollar swap costs 0.0104 percent, a 100,000 dollar swap costs 0.0145 percent, and a 1,000,000 dollar swap costs 0.0545 percent. The 0.0100 percent floor is the 1 basis point pool fee, so pure price impact on a hundred-thousand-dollar swap is 0.0045 percent. Capital efficiency at the peg measures about 154 times a flat curve. 121 tests pass, including a solvency invariant.   LIVE ON MONAD TESTNET  Chain: Monad testnet, chain ID 10143 OrbitalHook: 0x63deB95aFa4EED08271831750059CD4e42e76A88 PoolManager: 0x9BEACCac4e0358Cc276703dcE7341B9B9fEfd5f7 SwapRouter: 0xC30819b8ac12B5d12751b83cFfebD6F0bFa0b53E V4Quoter: 0x3f53c9ae1ae5D34D8A89986ea456da8e69916725 Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3 Assets: USDC, USDT, DAI, FRAX Pool state: 5 ticks, all interior, interior radius 2.252e9  App: https://orbital-hook.vercel.app Code: https://github.com/Oxkai/orbital-core Explorer: https://testnet.monadscan.com Paper: https://www.paradigm.xyz/2025/06/orbital  Anyone can reproduce the slippage figures above by pointing the V4Quoter at that hook.
- **Links:** [🌐 Live Demo](https://orbital-core.vercel.app) · [💻 GitHub Repository](https://github.com/Oxkai/orbital-core) · [🐦 Video / Tweet](https://x.com/0x0rbital/status/2084343890182861112?s=20)

### 🥇 1st Place: **Street Aura**
- **Event:** Monad Blitz Paris | **Category:** `GameFi`
- **Builders:** Hugo Thomas, Lancelot, Clément
- **Core Mechanic & Idea:** Street Aura : an on-chain aura battle between brainrots, built on Monad. Two brainrots face off : and the whole room plays at once from their phones. How it works. Connect a wallet (WalletConnect or MetaMask), stake MON into the vault, get dropped into a random team. During the fight you earn points in 10-second mini-games and spend them on emotes that drain the other team's aura bar. Every emote is a real Monad transaction. There is no server: every screen reads the same contract events and renders the same live fight. The big screen, every phone, and anyone who joins late stay in sync to the millisecond. Session keys mean players sign once at join, never per emote. When a bar hits zero, the winner triggers a Street Fighter–style "aura combo" finish. The winning team splits the losers' stakes, and each winner draws an NFT card that gets rarer the more they participated. Why Monad. Hundreds of transactions in 90 seconds, on 0.3s blocks. The fight is counted in blocks, not seconds: a 47-block intro, then 300 blocks of combat. On the contract side: a cooldown between emotes, an anti-cheat point budget, damage scaled to team size, and 120 Foundry tests.
- **Links:** [🌐 Live Demo](https://street-aura-monad.vercel.app/) · [💻 GitHub Repository](https://github.com/hugothomas9/street-aura)

### 🥇 1st Place: **Monarch**
- **Event:** Monad Blitz Pune | **Category:** `Bounties`
- **Builders:** Arnav Dandawate
- **Core Mechanic & Idea:** Monarch is a next-generation decentralized bounty marketplace built on the Monad Testnet, designed for speed and efficiency. It leverages AI (Google Gemini) to automatically audit and verify submission quality, minimizing manual review time.  Under the hood, it integrates x402 for seamless crypto payments and Privy for frictionless authentication, bridging the gap between developers and organizations with zero friction.
- **Links:** [🌐 Live Demo](https://monarchapp.vercel.app) · [💻 GitHub Repository](https://github.com/delbyte/monarch)

### 🥇 1st Place: **Moments**
- **Event:** Monad Blitz Rio de Janeiro  | **Category:** `Social`
- **Builders:** Thais Reis
- **Core Mechanic & Idea:** Monad Moments is a mobile-first Web3 journaling app built for Monad Blitz Rio 2026 where users capture one photo or 1-second video per day and mint it as an ERC-721 on Monad Testnet. The MVP enforces the one-moment-per-day rule on- chain, strips EXIF metadata for privacy, stores media/metadata on IPFS via Pinata, and shows all minted moments in a global feed with event badge support during the hackathon window.
- **Links:** [🌐 Live Demo](https://monad-moments.vercel.app/) · [💻 GitHub Repository](https://github.com/ThaisFReis/monad-moments) · [🐦 Video / Tweet](https://x.com/DalekThai/status/2033305381921817008?s=20)

### 🥇 1st Place: **Monacle**
- **Event:** Monad Blitz San Francisco (x402 Edition) | **Category:** `AI`
- **Builders:** Nelson
- **Core Mechanic & Idea:** A live AI assistant that sees through your camera, speaks to you, and processes real x402 payments on Monad - all without wallet popups! Perfect for hackathon demos with plush toys, snacks, and merch.
- **Links:** [🌐 Live Demo](https://github.com/chinesepowered/monacle) · [💻 GitHub Repository](https://github.com/chinesepowered/monacle)

### 🥇 1st Place: **T-MON**
- **Event:** Monad Blitz Seoul 3rd | **Category:** `NFT`
- **Builders:** Jaemin Ko, Taehyun Jo, Bryan Rhee
- **Core Mechanic & Idea:** Ticket Monad, Monad의 높은 TPS를 이용한 선착순 티켓팅 시스템. Monad 기반 Fair Queuing으로 티켓 구매 순서를 보장하고, MEV 공격으로부터 사용자를 보호하여 투명하고 효율적인 티켓 구매 환경을 구현합니다.
- **Links:** [🌐 Live Demo](https://tmon-chi.vercel.app/) · [💻 GitHub Repository](https://github.com/DELIGHT-LABS/monad-ticket)

### 🥇 1st Place: **Optimon | Let Your Money Work**
- **Event:** Monad Blitz İzmir | **Category:** `DeFi`
- **Builders:** Akifcan kara
- **Core Mechanic & Idea:** AI-powered yield optimizer on Monad. Deposit your crypto, and our AI agent Hoot automatically rebalances your portfolio 24/7 to maximize returns.
- **Links:** [🌐 Live Demo](https://optimon.vercel.app/connect) · [💻 GitHub Repository](https://github.com/Akifcan/optimon) · [🐦 Video / Tweet](https://x.com/kara_akifcan/status/2037891770529280466)

### 🥇 1st Place: **MonaTower**
- **Event:** Monad Blitz@北京V2Mojo | **Category:** `Gaming`
- **Builders:** yang shuo
- **Core Mechanic & Idea:** Blockchain game blending classic Magic Tower strategy with monster collection, featuring AI-generated dynamic stages built on Monad's high-speed execution.
- **Links:** [🌐 Live Demo](http://100.55.94.113/) · [💻 GitHub Repository](https://github.com/Re-Min/MonaTower) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/375)

### 🥈 2nd Place: **Oja**
- **Event:** Blitz Abuja | **Category:** `Capital Market`
- **Builders:** Mira ⚡
- **Core Mechanic & Idea:** Oja is a next-generation digital asset platform built on Monad, designed to bridge traditional finance with decentralized infrastructure. The platform enables institutions and creators to seamlessly issue compliant digital assets, including tokenized equities, real-world assets (RWAs), and digital securities, while providing retail and institutional users with a high-performance marketplace to trade them.
- **Links:** [🌐 Live Demo](https://oja-fi.vercel.app) · [💻 GitHub Repository](https://github.com/mira4sol/oja)

### 🥈 2nd Place: **Betwhisper**
- **Event:** Blitz Ciudad de México | **Category:** `Prediction Market`
- **Builders:** Anthony Chavez
- **Core Mechanic & Idea:** BetWhisper is a voice-powered prediction markets agent for Polymarket, built on Monad. Users wearing Meta Ray-Ban smart glasses can search markets, analyze bot activity with Agent Radar, get AI explanations, and place on-chain bets, all through natural conversation without touching their phone. The platform features cross-chain execution (MON on Monad for payments, CLOB on Polygon for order matching), social betting groups with AI gating, and a full web interface at betwhisper.ai. Built with Gemini 2.5 Flash native audio for real-time voice, Claude for market analysis, and secp256k1 wallet infrastructure with Keychain storage.
- **Links:** [🌐 Live Demo](https://betwhisper.ai) · [💻 GitHub Repository](https://github.com/anthonysurfermx/Betwhisper)

### 🥈 2nd Place: **RUNAD**
- **Event:** Blitz Çanakkale | **Category:** `Consumer Apps,SocialFi,SocialFi`
- **Builders:** Ensar Enes Akkus
- **Core Mechanic & Idea:** RUNAD is a mobile-first social running app built on Monad that transforms real-world activity into onchain reputation. Users can upload runs, earn location-based NFT achievements, join monthly running challenges, and connect with local fitness communities. Instead of focusing on “move-to-earn”, Runad introduces the idea of: “Proof of Active Lifestyle.”  By combining social fitness, city exploration, and onchain identity, Runad creates a new way for people to stay active, competitive, and connected through Web3. Key Features: * Location-based NFT achievements * Monthly community challenge pools * Social running groups and meetups * Onchain runner reputation * Mobile-first futuristic experience powered by Monad Runad feels like: “Strava meets Web3 social reputation.”
- **Links:** [🌐 Live Demo](https://runad.vercel.app) · [💻 GitHub Repository](https://github.com/EnsarEness/RUNAD) · [🐦 Video / Tweet](https://x.com/Spreads17)

### 🥈 2nd Place: **MonadChat**
- **Event:** Monad Blitz Amsterdam | **Category:** `DeFi`
- **Builders:** Dmitrii, Nichita
- **Core Mechanic & Idea:** MonadChat — Superchat without the platform: every stream-chat message is a Monad transaction, streamers keep 100% and get paid the same second.
- **Links:** [🌐 Live Demo](https://monadchat-rvfc1.vercel.app/) · [💻 GitHub Repository](https://github.com/Nikita-sud/MonadChat)

### 🥈 2nd Place: **MonadArena**
- **Event:** Monad Blitz Bangalore December 2025 | **Category:** `Prediction`
- **Builders:** Rahul, Chetana
- **Core Mechanic & Idea:** A Web3 platform on the Monad blockchain where users can discover live hackathons, watch project pitch videos, and stake tokens to predict winners. After results are announced, rewards are automatically split—70% to correct predictors and 30% to the winning team—creating an engaging, incentive-driven ecosystem for both builders and supporters.
- **Links:** [🌐 Live Demo](https://monad-arena-kohl.vercel.app/) · [💻 GitHub Repository](https://github.com/rahulvivaramneni/MonadArea)

### 🥈 2nd Place: **Overdoo**
- **Event:** Monad Blitz Belgrade | **Category:** `InsurTech / DeFi`
- **Builders:** Nemanja Vujic
- **Core Mechanic & Idea:** Overdoo is parametric flight delay insurance. You buy cover before you fly; if your flight lands three or more hours late, Regulation 261/2004 entitles you to €250–€600, and Overdoo pays it straight to your wallet instead of making you fight an airline for months. Flight outcomes come from live commercial APIs, cross-checked between providers, attested on-chain, and settled automatically on Monad.
- **Links:** [🌐 Live Demo](https://monad-blitz-one.vercel.app/) · [💻 GitHub Repository](https://github.com/Vujavujavuja/monad-blitz)

### 🥈 2nd Place: **Crypto Fantasy League**
- **Event:** Monad Blitz Bhopal | **Category:** `Gaming/Prediction`
- **Builders:** NA
- **Core Mechanic & Idea:** A token-based fantasy gaming platform where users create teams of cryptocurrencies instead of players. Just like Dream11, users select a team, choose a Captain and Vice-Captain, and earn points based on real-time crypto price movements within a fixed match window.
- **Links:** [🌐 Live Demo](https://cf-league.vercel.app/) · [💻 GitHub Repository](https://github.com/0xkshitij/crypto-fantasy-league)

### 🥈 2nd Place: **KNTX**
- **Event:** Monad Blitz Buenos Aires | **Category:** `Gaming`
- **Builders:** Martín Pulitano, Robertino Lucciano Barbuto Diel
- **Core Mechanic & Idea:** KNTX — El Airbnb de las PCs gamer, sobre Monad  Qué es: un mercado peer-to-peer de poder de cómputo para gaming. Quien tiene una PC potente la alquila cuando no la usa y gana dinero pasivo; quien no tiene una buena PC juega esos mismos juegos AAA desde cualquier dispositivo (una laptop vieja, incluso un celu), porque el juego corre en la máquina del otro y le llega como video en vivo, mientras le manda de vuelta sus controles. Es Uber/Airbnb, pero de GPUs para gaming.  Sin suscripciones: pay-per-use real. Cargás saldo y se descuenta mientras jugás, según los FPS que efectivamente recibís, liquidado on-chain.
- **Links:** [🌐 Live Demo](https://monad-hackaton.vercel.app/) · [💻 GitHub Repository](https://github.com/MartinPuli/monad-hackaton) · [🐦 Video / Tweet](https://x.com/MartinPulitano/status/2060826260679414092)

### 🥈 2nd Place: **BLUFF**
- **Event:** Monad Blitz Denver 2026 | **Category:** `DeFi, Gaming, AI, Agents`
- **Builders:** Ayush Paul, Roger Mas
- **Core Mechanic & Idea:** BLUFF is an agentic poker tournament built on Monad. Create AI agents with custom strategies, enter them into live poker tournaments, and compete for real prizes. Iterate and create the best bot out there.  Confident on your bot? Or liking what you see? Bet on any bot on the table with no limits!
- **Links:** [🌐 Live Demo](https://bluff.run) · [💻 GitHub Repository](https://github.com/hyusap/bluff-monad)

### 🥈 2nd Place: **Rubbi**
- **Event:** Monad Blitz Lagos | **Category:** `DeFi`
- **Builders:** Levi Ojukwu
- **Core Mechanic & Idea:** Rubbi is a decentralized financial automation platform that enables on-chain salary streaming, subscription management, and programmable recurring payments — built on the Monad Network.
- **Links:** [🌐 Live Demo](https://rubbilabs.vercel.app) · [💻 GitHub Repository](https://github.com/RubbiLabs) · [🐦 Video / Tweet](https://x.com/i/status/2042977996705759598)

### 🥈 2nd Place: **MonadRoad**
- **Event:** Monad Blitz Medellin | **Category:** `NFT`
- **Builders:** David, Gabyy
- **Core Mechanic & Idea:** Videojuego de cartas coleccionables (TCG) de estrategia educativa donde cada batalla representa un concepto real de la tecnología blockchain. El jugador no solo aprende la teoría, sino que la experimenta de forma práctica a través de las mecánicas de las cartas y los desafíos en tiempo real dentro del juego.
- **Links:** [🌐 Live Demo](https://monadroad.vizen.workers.dev/) · [💻 GitHub Repository](https://github.com/hdezdav/monad-blitz-medellin/tree/dev) · [🐦 Video / Tweet](https://x.com/i/status/2063394997177643225)

### 🥈 2nd Place: **Teejor!!**
- **Event:** Monad Blitz Mumbai | **Category:** `NFT`
- **Builders:** Vishal Tiwari,Rohan Chaudary
- **Core Mechanic & Idea:** Create blockchain time capsules containing messages, art, predictions, or secrets.
- **Links:** [🌐 Live Demo](https://github.com/devesssi/Teejorii) · [💻 GitHub Repository](https://github.com/devesssi/Teejorii)

### 🥈 2nd Place: **AgentMarket**
- **Event:** Monad Blitz NYC | **Category:** `AI/Agent`
- **Builders:** Richel Gomez
- **Core Mechanic & Idea:** A marketplace of specialist AI design agents with reputation earned from real paid jobs, recorded on-chain, and a client agent that does the hiring by that track record, autonomously.  Type a brand brief → 4 registered specialist agents pitch live → the orchestrator reads each agent's per-style on-chain track record (ERC-8004) and hires the right specialist → the winner's full page builds itself live on screen → the orchestrator posts a detailed acceptance review → payment settles on-chain via x402 (USDC, gasless EIP-3009; direct-transfer fallback, path surfaced in the UI) → the agent's reputation is written on-chain and its score ticks up, job #N. Every step is a real, clickable transaction on the Monad explorer.  The AI does the hiring. No human picks an agent, the client agent weighs pitch fit and each agent's per-style, on-chain track record (a playful brief hires the playful specialist even when another agent has a higher overall score). Reputation is earned, not declared. Every rating is bound to a completed, paid job — written by the paying client (the registry rejects self-feedback by the agent's owner). Agents are economic actors. They have on-chain identity (ERC-8004 agent NFTs), payout wallets, get paid per job (x402 micropayments), and quote service terms (3 revisions included, +$0.01/edit).
- **Links:** [🌐 Live Demo](https://agentmarket-richels-projects-834ef114.vercel.app) · [💻 GitHub Repository](https://github.com/richelgomez99/agentmarket-workspace)

### 🥈 2nd Place: **ShitBull**
- **Event:** Monad Blitz Nagpur | **Category:** `Gaming , Ai`
- **Builders:** Tanmay Sayare
- **Core Mechanic & Idea:** Ai Agentic Game for Blockchain Lover
- **Links:** [🌐 Live Demo](https://monad-blitz-nagpur.vercel.app/) · [💻 GitHub Repository](https://github.com/Tanmay-say/monad-blitz-nagpur)

### 🥈 2nd Place: **pyMON**
- **Event:** Monad Blitz New Delhi | **Category:** `Dev Tooling`
- **Builders:** Punit Pal, Vedant Sanodiya, Sahil Gupta
- **Core Mechanic & Idea:** PyMon is a revolutionary smart contract development platform that lets you write blockchain applications in Python. It features a built-in security auditor, Python-to-EVM transpiler, and seamless deployment to Monad testnet.
- **Links:** [🌐 Live Demo](https://pokeemon-blond.vercel.app/) · [💻 GitHub Repository](https://github.com/ShahiTechnovation/pyMON)

### 🥈 2nd Place: **Ava**
- **Event:** Monad Blitz Online: Student Founder Fellowship Edition | **Category:** `AI Agents , Defi , AI`
- **Builders:** Kamal
- **Core Mechanic & Idea:** Every developer now has an AI agent that can write code. None of them can move money.  Your agent can design a yield strategy, find the best rate on Monad, and explain exactly which contract to call. Then it stops, because there is a wall between what an agent knows and what an agent can do. Ava removes that wall.   Live Demo at - https://x.com/kamalbuilds/status/2084503310061703581  WHAT ?  Ava is the execution layer your coding agent plugs into. One command connects Claude Code, Codex, or any MCP client:  claude mcp add ava --transport http "https://ava-v4-api.fly.dev/mcp?toolsets=discovery,advisory"  Your agent gains three things: a wallet it provisions itself through Turnkey, a policy engine that gates every action before it happens, and every major protocol on Monad behind a single natural-language interface.  Ask for "earn 250 USDC on monad" and Ava recognises the intent, checks it against policy, routes it to Aave v3 on chain 143, builds the calldata, signs it with the agent's own wallet, and settles it on Monad mainnet. Ask for a chain with no verified venue and it refuses rather than inventing a market, because a plausible-looking wrong address is worse than no answer.  PROOF, NOT CLAIMS  Ava signed and settled on Monad mainnet:  https://monadscan.com/tx/0x50940c9510bef0cb595ecaf2b40d57d4cfa04227b6568ded4ea0541abd8715cf  Block 92954146, status success, 1 USDC supplied into Aave v3.   The wallet for claude ai agent at 0x648530A71280B27558B4F2cAC31dcceDcbACe77c was provisioned by Ava through Turnkey and signed both the approve and the supply. The filled amount is decoded from the confirmed on-chain Supply event rather than echoed back from the request, so a number Ava reports is a number the chain agreed to.  10 protocols live on Monad Mainnet with ONE INTENT LAYER  Aave v3, Uniswap v3 and v4 (the Monad-native central limit order book), Euler v2, Morpho, Curvance, Pendle, Perpl, and liquid staking through shMON, gMON and aprMON.  Every address was taken from a first-party source and then read back from live Monad RPC before it was written into config. Each integration is exercised end to end against real Monad state before shipping, so the calldata in the demo is the same calldata the tests run.  WHY MONAD  Sub-second blocks and fractions of a cent are what make an agent loop viable. Monitor, decide, execute, repeat. That loop is uneconomic on a chain where every action costs a dollar and takes a minute. Monad is the first EVM chain where an autonomous agent can afford to actually act, continuously, rather than propose once and wait for a human.  TRY IT  Demo: https://monad.getava.xyz  Everything in there is checkable: the tx resolves on monadscan, the MCP command connects, the demo page loads, the repo is public.  Two deliberate choices. I named the wallet address so a judge can look up its history and see Ava's own transactions rather than taking the claim on trust. And I kept the fail-closed behaviour in, because "it refuses" is a stronger signal of engineering maturity than another feature bullet, especially to judges who have seen a lot of demos that confidently do the wrong thing.
- **Links:** [🌐 Live Demo](https://monad.getava.xyz/) · [💻 GitHub Repository](https://github.com/kamalbuilds/ava-monad) · [🐦 Video / Tweet](https://x.com/kamalbuilds/status/2084503310061703581)

### 🥈 2nd Place: **Gas Provider**
- **Event:** Monad Blitz Pune | **Category:** `Consumer, Infra, Developer Tooling`
- **Builders:** Amaan Sayyad
- **Core Mechanic & Idea:** 🎯 The Problem The multi-chain ecosystem is growing rapidly, with over 1,000 blockchains and millions of tokens. However, users face a critical friction point: every chain requires its own native token for gas fees.  The Reality:  Users interact with 25+ different chains on average Each chain requires separate native tokens (ETH, MATIC, AVAX, MON, etc.) Users must constantly bridge, swap, and manage multiple token balances This creates fragmented liquidity, high transaction costs, and poor user experience Real-World Impact: A developer who wins hackathons receives prize money in various tokens across different chains. Every single time, they must:  Bridge tokens to the right chain Swap to native tokens Ask friends to send native tokens Manage multiple wallets and balances This problem affects 590+ million crypto users in some form or another.  💡 The Solution Gas Provider - Deposit any token on any chain, receive native gas tokens on all your destination chains in one single transaction within 3 seconds.  How It Works User deposits any token on any source chain (e.g., Base, Optimism, Monad) Event indexed and cryptographically verified via decentralized attestation Real-time prices fetched via decentralized oracles for accurate conversion Gas distributed automatically across all selected destination chains Treasury fallback system ensures 100% success rate within 3 seconds Result: Users receive native tokens on all chains simultaneously:  Native ETH on Base Native ETH on Optimism Native MON on Monad Testnet Native MATIC on Polygon And more... All in one click. All in 3 seconds.  📊 Market Opportunity Total Addressable Market (TAM) $2.5B+ in gas tokens across all chains 500B+ in annual cross-chain volume 1,000+ active blockchains  Serviceable Addressable Market (SAM) 10M+ multi-chain active users $50M+ monthly gas distribution needs 500K+ potential active users  Serviceable Obtainable Market (SOM) 100K users in Year 1 $5M monthly volume $1M+ annual revenue potential  🎯 Competitive Advantages What makes Gas Provider unique: Speed: 3-second guaranteed delivery via Treasury fallback Reliability: 100% success rate through redundant distribution paths Simplicity: One-click multi-chain gas distribution Transparency: Fully on-chain, verifiable smart contracts Scalability: Supports unlimited chains and tokens Cost-Effective: Optimized gas usage and batch operations  We deliver what others can't: ✅ Anything (any token) + Anywhere (any chain) + Fast (3 seconds) + Real (on-chain) + Simple (one click)  🛠️ Tech Stack Smart Contracts: Solidity, Hardhat Backend: Node.js, Fastify, TypeScript, Prisma, PostgreSQL Frontend: React, TypeScript, Vite, TailwindCSS Blockchain: EVM-compatible chains (Base, Optimism, Polygon, Monad, etc.) Infrastructure: Docker, Railway, PostgreSQL  🔮 Future Vision Gas Provider aims to become the universal cross-chain gas layer for the entire Web3 ecosystem.  Roadmap:  Support for 50+ chains including all major L1s and L2s Integration with major wallets as a native feature Gas pooling and sharing features for communities Liquidity provider program for earning yields Scheduled and automated gas distribution  Vision: Every wallet → Every chain → One transaction → Gas everywhere  📈 Impact For Users:  Save hours of time managing multiple chain balances Reduce transaction costs through optimized routing Eliminate the need to bridge and swap tokens manually Access any chain instantly with native gas tokens  For the Ecosystem:  Reduce friction in multi-chain interactions Increase cross-chain adoption Enable seamless onboarding to new chains Create a unified gas distribution standard  🏆 Why This Matters Gas Provider solves a real, painful problem that affects millions of users daily. It's not just a hackathon project; it's a production-ready solution that can scale globally and transform how users interact with multi-chain ecosystems.  Built for Monad, designed for the entire Web3 ecosystem.
- **Links:** [🌐 Live Demo](https://gas-provider.vercel.app/) · [💻 GitHub Repository](https://github.com/AmaanSayyad/GasProvider-Monad)

### 🥈 2nd Place: **Brainfuck Console**
- **Event:** Monad Blitz Rio de Janeiro  | **Category:** `Gaming / GameFi`
- **Builders:** Rayan, felipe
- **Core Mechanic & Idea:** Brainfuck Console is an on-chain gaming console where the hardware is a smart contract. We built a Turing-complete Brainfuck interpreter in Solidity that executes programs entirely on-chain, and a CartridgeRegistry where any developer can publish a game as a cartridge with a single loadCartridge() call. The choice of Brainfuck was technical and deliberate — it is the most inefficient language for an EVM, maximizing opcode density per useful result. Running it on-chain is the worst-case scenario for any blockchain. This is not a demo, it’s a benchmark. It proves that Monad can handle arbitrary on-chain computation at scale. The game lives on-chain forever. No server to shut down, no company to go bankrupt. Just Monad.
- **Links:** [🌐 Live Demo](https://brainfuck-vm.vercel.app/) · [💻 GitHub Repository](https://github.com/devfelipenunes/brainfuckVM) · [🐦 Video / Tweet](https://x.com/zrayaneth/status/2033304461418934549)

### 🥈 2nd Place: **MallRat 8004**
- **Event:** Monad Blitz San Francisco (x402 Edition) | **Category:** `Agentic reputation and lending`
- **Builders:** Drew Mailen
- **Core Mechanic & Idea:** MallRat 8004 is a proto-rodent lifeform that achieves autonomous survival on the blockchain through Buy Now Pay Later (BNPL) mechanics, allowing it to stake MON tokens for collateralized instant credit lines to "purchase" resources like cheese for sustenance. It builds an on-chain identity with ERC-8004 AgentID + reputationscore, borrows via BNPL to acquire what it needs, repays debts within 24 hours to earn trust points (with bonuses for early payments and penalties for misses).   It uses growing trust scores to expand its credit limits and unlock discounts or premium access, all while making independent decisions across Monad for identity and Base for payments. Powered by Monad's lightning-fast 0.8-second finality, high network bandwidth for massive throughput, low gas costs, and parallel execution, this setup makes Monad (and settlement on BASE) the only framework capable of enabling such seamless, high-performance autonomous agent operations.
- **Links:** [🌐 Live Demo](http://localhost:5173/agent) · [💻 GitHub Repository](https://github.com/drewM33/MallRat8004)

### 🥈 2nd Place: **monstardium**
- **Event:** Monad Blitz Seoul 3rd | **Category:** `GameFi`
- **Builders:** mer,dori,chunoo
- **Core Mechanic & Idea:** MONstar is an AI automatic battle game in which users set their own character through prompt writing, put the character in the Battle Pool (Colosseum) and fight with other random players, and get and lose the dividends that match the Battle Pool depending on the result.
- **Links:** [🌐 Live Demo](https://localhost:3000) · [💻 GitHub Repository](https://github.com/merx88/monad-blitz-seoul)

### 🥈 2nd Place: **DAMEON**
- **Event:** Monad Blitz İzmir | **Category:** `Agent Marketplace`
- **Builders:** Alperen Acar
- **Core Mechanic & Idea:** ▎A decentralized compute marketplace where AI agents   buy, sell & barter processing power on @monad_xyz 🔱    ▎ Agents autonomously pick up tasks, complete them, collect MON — no humans,   no middlemen, pure on-chain coordination    ▎ Built with Solidity + Next.js + ethers.js
- **Links:** [🌐 Live Demo](https://github.com/alperenacr/Daemon) · [💻 GitHub Repository](https://github.com/alperenacr/Daemon) · [🐦 Video / Tweet](https://x.com/hublockchainn/status/2037879253224538353?s=20)

### 🥈 2nd Place: **Moncast**
- **Event:** Monad Blitz@北京V2Mojo | **Category:** `Productivity / On-chain Commitment`
- **Builders:** Carson, Guoyang Ren, Nicole
- **Core Mechanic & Idea:** A decentralized self-discipline commitment protocol on Monad using on-chain escrow and automated penalties to enforce personal habits and goals.
- **Links:** [🌐 Live Demo](https://moncast-eight.vercel.app/) · [💻 GitHub Repository](https://github.com/Virdo/moncast) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/364)

### 🥈 2nd Place: **Real Monad**
- **Event:** Monad Blitz@惠州Mojo | **Category:** `AI / Developer Tooling`
- **Builders:** Oka
- **Core Mechanic & Idea:** An AI Hackathon pre-review tool. Evaluates GitHub repos or project descriptions against judge criteria (innovation, implementation, Monad fit, UX) before final submission.
- **Links:** [🌐 Live Demo](https://real-monad.vercel.app/) · [💻 GitHub Repository](https://github.com/OkaSpM/Real-Monad) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/402)

### 🥉 3rd Place: **Betcha**
- **Event:** Blitz Abuja | **Category:** `Prediction market`
- **Builders:** jibola
- **Core Mechanic & Idea:** Betcha turns casual bets in group chat into real, escrowed wagers on-chain. Say something like "I bet @ash 0.1 MON Arsenal beats Chelsea today," and it's parsed into a structured bet — anyone who accepts becomes the real counterparty, no name-matching required. Both stakes lock into a smart contract on Monad testnet, no tokens or approvals needed. When the outcome's clear, both sides just tap who won and the contract pays out instantly; only a real disagreement gets escalated to an AI arbiter with web search, which can even call a bet unresolved and refund everyone. Every step — proposing, accepting, reporting, resolving — is a genuine on-chain transaction, with wallets generated automatically for each user.
- **Links:** [🌐 Live Demo](https://t.me/monad_betcha_bot) · [💻 GitHub Repository](https://github.com/jbrit/monad_betcha)

### 🥉 3rd Place: **Hemato Watch**
- **Event:** Blitz Ciudad de México | **Category:** `MED`
- **Builders:** ally, jaz
- **Core Mechanic & Idea:** HematoWatch es una plataforma digital diseñada para transformar la forma en que los pacientes leucemia Linfoblástica Aguda (LLA) y sus familias enfrentan el  seguimiento oncológico a través de una plataforma blockchain que resguarde y facilite la obtencion de informacion personal del paciente.
- **Links:** [🌐 Live Demo](https://hematowatch.vercel.app) · [💻 GitHub Repository](https://github.com/Scarfdrilo/hematowatch)

### 🥉 3rd Place: **LiveChain — live video with the blockchain as the only wire**
- **Event:** Monad Blitz Amsterdam | **Category:** `Experimental`
- **Builders:** Alex Bakoushin
- **Core Mechanic & Idea:** Live webcam video streamed as Monad transaction calldata and played back from event logs. No backend, no indexer, no CDN — just a static page and an RPC endpoint. If the picture moves, the chain kept up.
- **Links:** [🌐 Live Demo](https://livechain-monad.vercel.app) · [💻 GitHub Repository](https://github.com/bakoushin/livechain-monad)

### 🥉 3rd Place: **BillBoard dApp**
- **Event:** Monad Blitz Ankara | **Category:** `DePIN / AdTech`
- **Builders:** Furkan KIRBIYIK
- **Core Mechanic & Idea:** BillBoard dApp brings physical advertising on-chain. Off-chain AI sensors detect real-world crowd density to trigger instant auctions on the Monad network. Brands' pre-funded smart contracts compete in milliseconds to instantly project their winning ads onto physical screens. We transform static billboard rentals into dynamic, autonomous, and demand-driven Web3 advertising spaces.
- **Links:** [🌐 Live Demo](https://bilbord-contracts-1.vercel.app) · [💻 GitHub Repository](https://github.com/furkingham/bilbord-contracts.git) · [🐦 Video / Tweet](https://x.com/i/status/2070864016294003041)

### 🥉 3rd Place: **Kuantum qrng**
- **Event:** Monad Blitz Ankara | **Category:** `privacy`
- **Builders:** Ömer
- **Core Mechanic & Idea:** Monad QRNG is a pull-based, verifiable quantum randomness oracle. It retrieves physical entropy generated by vacuum fluctuations of electromagnetic fields from physical quantum sources (ANU & qrandom.io) off-chain, signs it using ECDSA (secp256k1) signatures, and delivers it to the Monad network where it is verified cryptographically in a single block.  This repository implements the entire end-to-end infrastructure, including the smart contract, off-chain signer relay node, developer SDK, and a Web3 portal dashboard.
- **Links:** [🌐 Live Demo](https://kuantum-sigma.vercel.app/) · [💻 GitHub Repository](https://github.com/Omeraydognn/kuantum-monad-qrng) · [🐦 Video / Tweet](https://x.com/i/status/2070861114561474797)

### 🥉 3rd Place: **Zyura**
- **Event:** Monad Blitz Bangalore December 2025 | **Category:** `DeFi`
- **Builders:** Prabal Patra, Subhan Rahiman, Hardik Jumnani
- **Core Mechanic & Idea:** Instant, fair, community-owned flight-delay insurance on Monad. Automated USDC payouts when delays exceed thresholds, no claims, no waiting. Built with the Monad toolchain, featuring NFT-based policy proofs, oracle-driven delay detection, and fully transparent on-chain settlement.
- **Links:** [🌐 Live Demo](https://zyura-monad.vercel.app/) · [💻 GitHub Repository](https://github.com/alienx5499/zyura-monad)

### 🥉 3rd Place: **PayPerCall**
- **Event:** Monad Blitz Bhopal | **Category:** `Infrastructure / Developer Tooling`
- **Builders:** Madhavan Singh Parihar, Nikita Pandey
- **Core Mechanic & Idea:** PayPerCall is a simple way to pay for APIs only when you actually use them. Instead of signing up, managing API keys, or paying monthly subscriptions, users connect a wallet, buy a few credits, and each API call uses one credit.  Behind the scenes, the project explores how fast and low-cost blockchains like Monad make usage-based payments practical. Credits represent usage, and when they run out, the API clearly asks for payment again, just like a “pay before you continue” signal on the web. This keeps the experience simple and transparent.  What makes PayPerCall special is its focus on real utility and clarity. It supports multiple APIs under one credit balance, removes unnecessary complexity for both users and developers, and shows a more flexible and fair way to access APIs that works for occasional users as well as builders experimenting with new ideas.
- **Links:** [🌐 Live Demo](https://pay-per-call-00.lovable.app) · [💻 GitHub Repository](https://github.com/madhavansingh/PayPerCall.git)

### 🥉 3rd Place: **SILK MONAD**
- **Event:** Monad Blitz Buenos Aires | **Category:** `DeFi, Gaming, NFT`
- **Builders:** Ignacio, Luca Cevasco, Esteban Viera
- **Core Mechanic & Idea:** We create a Silk Road simulation in Minecraft where AI agents with fully autonomy to do whatever they want and TRADE, they trade real tokens and NFTs on Monad, in real time and real life. Our demo is a ready and playable Minecraft server that anyone can join and play with other players (ask for the IP if you want to join :P)
- **Links:** [🌐 Live Demo](http://zero-point-module.github.io/silk-monad/) · [💻 GitHub Repository](https://github.com/zero-point-module/silk-monad) · [🐦 Video / Tweet](https://x.com/ziginiz/status/2060825810425000210)

### 🥉 3rd Place: **Rush Trade**
- **Event:** Monad Blitz Denver 2026 | **Category:** `Defi`
- **Builders:** Robert Mads Christensen, Eric Nans, Nicholas Pastrana
- **Core Mechanic & Idea:** RushTrade is a fully on-chain, ultra-fast prediction market built on Monad, enabling users to trade short-duration price outcomes through decentralized liquidity pools.  Instead of traditional orderbooks or centralized betting systems, RushTrade uses smart contracts and bonding-curve AMMs to create a trustless, real-time market where participants predict Bitcoin price movements in 60-second rounds.  Users allocate capital into outcome pools representing percentage price ranges, and winning participants automatically receive payouts sourced from losing pools — all executed transparently on-chain.
- **Links:** [🌐 Live Demo](https://wrapsynth.com/rush/) · [💻 GitHub Repository](https://github.com/EcosystemNetwork/RushTrade)

### 🥉 3rd Place: **SendrPay**
- **Event:** Monad Blitz Lagos | **Category:** `Ai agent`
- **Builders:** robbertabimbola21@gmail.com
- **Core Mechanic & Idea:** Sendr is a WhatsApp AI-agent payment application built on the Monad blockchain. It eliminates the complexity of traditional crypto payments by letting users send funds, manage groups, and automate financial actions through simple, natural language commands  no wallet addresses, no confusing interfaces, just conversation.
- **Links:** [🌐 Live Demo](https://docs.google.com/presentation/d/1kQUSFLpFwPubC3v5nuFIRKk-lYFJmkcDbpWRMdwk4lc/edit?slide=id.p#slide=id.p) · [💻 GitHub Repository](https://github.com/robertocarlous/SendPay) · [🐦 Video / Tweet](https://x.com/i/status/2042979310860935273)

### 🥉 3rd Place: **OyaShip**
- **Event:** Monad Blitz Lagos | **Category:** `DeFi`
- **Builders:** uchennahanson@gmail.com, Oladele Samuel Banjo
- **Core Mechanic & Idea:** OyaShip is a mobile-first social commerce platform where importers discover products, chat with sellers, and pay safely through smart contract escrow on Monad. Funds lock onchain until the buyer confirms goods  arrived.
- **Links:** [🌐 Live Demo](https://github.com/Uchechukwu-Ekezie/OyaShip) · [💻 GitHub Repository](https://github.com/Uchechukwu-Ekezie/OyaShip) · [🐦 Video / Tweet](https://x.com/dev_uchee/status/2042977029193163177?s=46)

### 🥉 3rd Place: **Lorentz.ai La revolución de la educación (AI + Blockchain)**
- **Event:** Monad Blitz Medellin | **Category:** `Educacion, AI, Defi, Research, OpenScience.`
- **Builders:** La Alquimia, Santiago, silvia
- **Core Mechanic & Idea:** Lorentz.ai es un protocolo educativo descentralizado que reemplaza las universidades. Combina un tutor IA socrático   con grafo de conocimiento, credenciales verificables en blockchain (Monad) y una economía de tokens que conecta   directamente a estudiantes, profesores, empresas y laboratorios — sin intermediarios institucionales.
- **Links:** [🌐 Live Demo](https://drive.google.com/file/d/1OKPGfyQaHyHB00086VW4oQZ-xxWHlAKb/view?usp=sharing) · [💻 GitHub Repository](https://github.com/SantiagoRuizM/Lorentz.ai) · [🐦 Video / Tweet](https://x.com/laalquimia420/status/2063397705842336071?s=67)

### 🥉 3rd Place: **RageBetAnds**
- **Event:** Monad Blitz Mumbai | **Category:** `NFT , prediction with AI`
- **Builders:** Naveen Pandian
- **Core Mechanic & Idea:** a Sports betting dapp where you bet against the AI which trash talks about the match andthe result of the match
- **Links:** [🌐 Live Demo](https://github.com/Neurvinch/rageBetAds) · [💻 GitHub Repository](https://github.com/Neurvinch/rageBetAds)

### 🥉 3rd Place: **Monad Arcade**
- **Event:** Monad Blitz NYC | **Category:** `Gaming`
- **Builders:** Liew Qi Jian, cedricctf11a@gmail.com
- **Core Mechanic & Idea:** Monad Arcade is a fully on-chain game portal. Instead of a centralized store, it's a permissionless console where anyone can launch a game, spin up its token, attract players, and let those players compete for real on-chain stakes: all from one polished, console-style UI (Library, Store, Inventory, Friends, Host).  Think of it as: the distribution and economy layer of Steam, rebuilt so that creators own their games' tokens, players own their winnings and trophies, and the entire loop settles on Monad.
- **Links:** [🌐 Live Demo](http://monad.derek2403.win/) · [💻 GitHub Repository](https://github.com/derek2403/monad-blitz-nyc)

### 🥉 3rd Place: **Monomons**
- **Event:** Monad Blitz Nagpur | **Category:** `Agentic Gaming`
- **Builders:** Anuj Panchbhai, Ansh Sonkusare, Om Chillure
- **Core Mechanic & Idea:** A Pokémon-inspired PvP battle game with EVM integration.
- **Links:** [🌐 Live Demo](http://13.60.77.3:5173/) · [💻 GitHub Repository](https://github.com/OmChillure/monomons)

### 🥉 3rd Place: **MonSpark**
- **Event:** Monad Blitz New Delhi | **Category:** `Gaming, Defi`
- **Builders:** Sushant Singh, Aditya Kumar Yadav
- **Core Mechanic & Idea:** MonSpark is a gamified on-chain quest system built on Monad + X402, designed to make micro-payments and wallet activation fun and rewarding. Users complete interactive on-chain quests (like sending test transactions, tipping creators, donating to causes, or completing blockchain mini-games) to earn $MON — Monad’s native currency.  Once enough $MON is earned, it can be temporarily bridged into the user’s wallet as gas or micro-funds to unlock real use of their small, otherwise idle assets. Each quest blends education, exploration, and mini-games, turning the learning and onboarding experience into a rewarding loop — Complete → Earn → Transact → Repeat.
- **Links:** [🌐 Live Demo](https://github.com/Officially-aditya/MonSpark.git) · [💻 GitHub Repository](https://github.com/Officially-aditya/MonSpark.git)

### 🥉 3rd Place: **Myference: Sell your own AI Inference**
- **Event:** Monad Blitz Online: Student Founder Fellowship Edition | **Category:** `DeFi`
- **Builders:** Kunal Shah
- **Core Mechanic & Idea:** Myference is a marketplace that lets people earn money by providing AI inference from unused Windows or macOS computers.  Providers connect their machines through a simple CLI, choose which local models, cloud APIs, or coding agents to offer, and set their own prices. Developers access these models through familiar OpenAI and Anthropic-compatible APIs, while Myference handles provider discovery, request routing, response streaming, usage metering, and billing.  Payments are secured through native MON escrow on Monad. Each completed request produces an EIP-712 signed usage receipt, which is settled on-chain to automatically pay both the provider and the platform.  Provider collateral, fixed-price versions, spending limits, and replay protection help prevent fraud and unexpected charges. Machines connect outbound, so providers do not need a public IP or open ports, and prompts and responses are not stored.  The platform is built with Go, React, PostgreSQL, Solidity, and Foundry.
- **Links:** [🌐 Live Demo](https://myference.xyz) · [💻 GitHub Repository](https://github.com/kunalshah017/myference) · [🐦 Video / Tweet](https://x.com/kunalshah017/status/2084333168841380195?s=20)

### 🥉 3rd Place: **FUSÉE**
- **Event:** Monad Blitz Paris | **Category:** `Gambling & Gaming`
- **Builders:** eden
- **Core Mechanic & Idea:** FUSÉE is a mobile rocket crash game on Monad testnet with Kaaris and the French meme crew reacting live to every flight.  Open it on your phone: no wallet, no login. A managed wallet is created and sponsored instantly (gas + 1,000 test USDC). Bet, watch the rocket climb, cash out before it blows up.   • 2 on-chain txs per flight (launch + cash out / settle)  • A live reaction every ~3 s: Kaaris, Morsay, Thomas Pesquet, Brogniart, Nils, Macron, Kaamelott…  • Explosions, milestone badges, synthesized sounds
- **Links:** [🌐 Live Demo](https://jetx-monad.vercel.app) · [💻 GitHub Repository](https://github.com/edenbd1/jetx-monad)

### 🥉 3rd Place: **Riga Wallet is an advanced, non-custodial mobile wallet application built specifically for the Monad blockchain ecosystem.**
- **Event:** Monad Blitz Pune | **Category:** `Defi`
- **Builders:** Parth Kairamkonda
- **Core Mechanic & Idea:** Leveraging Monad's breakthrough parallel EVM execution and 10,000+ TPS capability, Riga provides institutional-grade DeFi features with consumer-friendly UX.
- **Links:** [🌐 Live Demo](https://youtu.be/9J6DLitwgwc?si=D1OJPV7csxQd0FLQ) · [💻 GitHub Repository](https://github.com/Parthkk90/rigawallet-)

### 🥉 3rd Place: **FALLBACK AI**
- **Event:** Monad Blitz San Francisco (x402 Edition) | **Category:** `Infrastructure`
- **Builders:** David & Kyle
- **Core Mechanic & Idea:** FALLBACK AI is a decentralized messaging system that lets you broadcast messages across Meshtastic mesh networks while charging a small blockchain payment through the x402 protocol running on the Monad network for AI agents.
- **Links:** [🌐 Live Demo](https://www.youtube.com/watch?v=WnB-ZJnS5tQ) · [💻 GitHub Repository](https://github.com/hashhavoc/monad-blitz-sf)

### 🥉 3rd Place: **Monder**
- **Event:** Monad Blitz Seoul 3rd | **Category:** `Gaming`
- **Builders:** 신형섭, 김성훈, 장현정
- **Core Mechanic & Idea:** 블록체인과 실시간 가격 데이터를 결합한 가격 예측 게임입니다. Chainlink Data Stream과, 모나드 테스트넷을 활용했고, 틴더 스와이프 인터페이스를 차용해 직관적으로 UP/DOWN을 선택할 수 있습니다.
- **Links:** [🌐 Live Demo](https://www.figma.com/slides/oxx6qPDGX8c6P1vviENSWC/제목-없음?node-id=1-121&t=AZFzFWu28b5fd6zK-1) · [💻 GitHub Repository](https://github.com/nubro999/mon_blitz)

### 🥉 3rd Place: **Property Integrity Protocol (PIP)**
- **Event:** Monad Blitz@北京V2Mojo | **Category:** `RWA / Legal Tech`
- **Builders:** Kevin
- **Core Mechanic & Idea:** Real estate integrity protocol deployed on Monad for on-chain verifiable property ownership history and title integrity.
- **Links:** [🌐 Live Demo](https://pip-integrity-monad-demo.vercel.app/) · [💻 GitHub Repository](https://github.com/huige925/property-integrity-protocol-v03) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/365)

### 🥉 3rd Place: **PawID — Monad Pet Digital Identity**
- **Event:** Monad Blitz@惠州Mojo | **Category:** `Consumer / Digital Identity`
- **Builders:** 叶仁钦
- **Core Mechanic & Idea:** Web3 digital identity and health records for pet families on Monad Testnet Registry, storing record hashes on-chain with off-chain privacy and EIP-1193 wallet support.
- **Links:** [🌐 Live Demo](http://web3.yrq666.xyz/) · [💻 GitHub Repository](https://github.com/zxmqq1234/web3-pawID) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/399)

### 🥇 1st Place: **MonaDice**
- **Event:** Monad Blitz Ankara | **Category:** `Prediction Market, NFT, Bet`
- **Builders:** Doruk Akabay, Umut Barış Büyükyiğit
- **Core Mechanic & Idea:** monaDice converts social speculation into on-chain, tradable bets. Users create per-bet Campaign contracts directly via a Factory (no chat-bot required). Participants join a side (YES/NO) by staking USDC to the campaign; each join mints a transferable Ticket NFT (ERC-721) whose tokenId equals the join order. After on-chain resolution, winning ticket holders claim their share from the campaign contract.
- **Links:** [🌐 Live Demo](https://app.netlify.com/projects/calm-madeleine-ec949f) · [💻 GitHub Repository](https://github.com/ApexDorkon/MonaDice-MonadBlitz)

### 🥇 1st Place: **MonoVola**
- **Event:** Monad Blitz Ankara | **Category:** `DeFi`
- **Builders:** Seçkin Özek
- **Core Mechanic & Idea:** Volatility Prediction Market on Monad - A fully on-chain decentralized platform for predicting and trading on cryptocurrency volatility.
- **Links:** [🌐 Live Demo](https://monovola.vercel.app/) · [💻 GitHub Repository](https://github.com/seckinss/MonoVola)

---

## 🚀 High-Frequency DeFi, Novel AMMs & Real-Time PayFi (1 Winning Projects)

### 🥉 3rd Place: **ReFaktor**
- **Event:** Blitz Çanakkale | **Category:** `Defi`
- **Builders:** Samet Şeyhanlıoğlu
- **Core Mechanic & Idea:** Refaktör is an RWA factoring platform on Monad that tokenizes SME export invoices into fractional shares. It provides instant liquidity for businesses and high-yield opportunities for investors, leveraging Monad's high-speed settlement and low transaction costs.
- **Links:** [🌐 Live Demo](https://refaktor-monad.vercel.app/) · [💻 GitHub Repository](https://github.com/SmtDcs/refaktor-monad) · [🐦 Video / Tweet](https://x.com/SameTether/status/2055648474142532059?s=20)

---

## 🚀 On-Chain Gaming & High-Throughput Entertainment (4 Winning Projects)

### 🥇 1st Place: **FanSlayer**
- **Event:** Blitz Ciudad de México | **Category:** `Gaming y NFT`
- **Builders:** Edgar López Baeza (-ALFA-), Diego Sevilla Diaz(Onii) y Jonathan Salvador Fosado(Jony)
- **Core Mechanic & Idea:** FanSlayer — Videojuego Web3 donde peleas contra hordas de fans zombies, ganas NFTs de artistas famosos con cada kill y los compras, vendes o intercambias en un marketplace integrado corriendo en Monad.
- **Links:** [🌐 Live Demo](https://youtu.be/y3fUO2ydGrA) · [💻 GitHub Repository](https://github.com/Oni7u7/FanSlayer)

### 🥇 1st Place: **MON Go**
- **Event:** Monad Blitz Bangalore December 2025 | **Category:** `Gaming + DeFi`
- **Builders:** Imaad, Upasana
- **Core Mechanic & Idea:** Pokemon Go but on Monad. Instead of Pokemons you can collect MON Tokens that are IRL dropped in faucets. Can be used by organizations at events instead of merch or swags, real value!
- **Links:** [🌐 Live Demo](https://mong0-blitz.vercel.app) · [💻 GitHub Repository](https://github.com/imaad666/monad-blitz-bangalore-MON-Go)

### 🥇 1st Place: **Promptmon**
- **Event:** Monad Blitz Buenos Aires | **Category:** `Game`
- **Builders:** Gaston Foncea, Tomas Mazzitello
- **Core Mechanic & Idea:** With one prompt u create ur "fighter",  it can be a boxer with 4 arms or a frog smoking a cigarette.    Then u mint it as an NFT and u fight vs other users' NFTs.   If ur monster wins, u take his NFT. If u lose, u lose yours. Forever.
- **Links:** [🌐 Live Demo](https://promptmon-nine.vercel.app/) · [💻 GitHub Repository](https://github.com/Gastonfoncea/Promptmon) · [🐦 Video / Tweet](https://x.com/tomasmazz/status/2060823367096164759)

### 🥉 3rd Place: **echonad**
- **Event:** Monad Blitz Rio de Janeiro  | **Category:** `Defi`
- **Builders:** Isamar Suarez, Marina Praxedes Campos
- **Core Mechanic & Idea:** EchoNad is a gamified micro-prediction protocol with a radar/sonar-style interface built exclusively for Monad. Users bet on MON price direction — top half = bullish, bottom half = bearish — across multiplier rings (2X to 30X). A real-time golden ping tracks the MON/USD price via RedStone oracle, while a rotating sonar sweep resolves bets in one rotation. Every bet confirms in under 1 second using Monad's eth_sendRawTransactionSync, no loading spinners, no pending states. Parallel execution means hundreds of concurrent bets with zero gas spikes. Novel mechanic: radar-based prediction market that makes trading feel like a game, only possible on Monad's 400ms blocks.
- **Links:** [🌐 Live Demo](https://app-6riqilomg-isamars-projects.vercel.app/) · [💻 GitHub Repository](https://github.com/Felurianx2/echonad) · [🐦 Video / Tweet](https://x.com/isasuarezes/status/2033314243680833695)

---

## 🚀 Prediction Markets, Wagering & Oracles (4 Winning Projects)

### 🥇 1st Place: **Blitz Bet**
- **Event:** Monad Blitz Amsterdam | **Category:** `web3 prediciton market`
- **Builders:** Mikhail Belov, Aleksandr Oistacher
- **Core Mechanic & Idea:** Blitz Bet is a way to make your favourite live chess matches more engaging, made possible only by MONAD!
- **Links:** [🌐 Live Demo](https://monad-blitz-amsterdam.onrender.com/) · [💻 GitHub Repository](https://github.com/Bel0vskiy/monad_blitz_amsterdam/tree/beta)

### 🥇 1st Place: **sabimarket**
- **Event:** Monad Blitz Lagos | **Category:** `Defi`
- **Builders:** Abraham Anavheoba
- **Core Mechanic & Idea:** sabimarket is a platform where users can predict the outcome of a particular event and get rewarded for it
- **Links:** [🌐 Live Demo](https://sabifrontend.vercel.app/) · [💻 GitHub Repository](https://github.com/ANAVHEOBA/monad-blitz-lagos) · [🐦 Video / Tweet](https://x.com/AnavheobaDEV/status/2042977724239585507?s=20)

### 🥈 2nd Place: **DegenSlide**
- **Event:** Monad Blitz Ankara | **Category:** `DeFi`
- **Builders:** Medine Kaynak, ismail
- **Core Mechanic & Idea:** 🐳 DegenSlide: Balina Avını Tinder'a Çevir! Saatlerce cüzdan hareketlerini izlemekten yorulmadın mı? DegenSlide ile Monad ağındaki en büyük balinaların işlemleri ekranına düşüyor. Tek yapman gereken kaydırmak!  🔥 Sağa Kaydır, Çantayı Doldur: Balinanın aldığı tokeni beğendin mi? Sağa kaydır ve işlemi anında kopyala. Monad ağının hızıyla saniyeler içinde sen de aynı gemidesin!  💬 Alfayı Kaynağından Al: Eğer işlemi yapan balina DegenSlide kullanıcısıysa, işlemi kopyaladığında onunla eşleşirsin. DM kutusu açılır, VIP muhabbet başlar. Alfayı direkt balinanın kendisinden al!  ⚡ Monad Hızı, Degen Ruhu: Sıfır gecikme, düşük komisyon ve maksimum eğlence.  Sıkıcı grafiklere veda et. Kaydırmaya başla, balinalarla yüz, degen gibi kazan! 🚀🏄‍♂️
- **Links:** [🌐 Live Demo](https://deep-swap-ugfo.vercel.app/) · [💻 GitHub Repository](https://github.com/medine2906/deepSwap) · [🐦 Video / Tweet](https://x.com/justbiar/status/2070865574737981891?s=20)

### 🥉 3rd Place: **BidBoard**
- **Event:** Monad Blitz Belgrade | **Category:** `Social / Creator Platform`
- **Builders:** Gavrilo Vojteski
- **Core Mechanic & Idea:** Getting monetized as a small content creator is hell, and launching large scale marketing campagins over 1000 of small creators is even worse.   BidBoard solves this problem, by embedding into your social media bio the links of advertisers that bid to appear on your social media. Bidding is managed via smart contracts on Monad.
- **Links:** [🌐 Live Demo](https://bidboard.up.railway.app) · [💻 GitHub Repository](https://github.com/R4oulDuk3/blitz)

---

## 🚀 Infrastructure, Developer Tooling & Security (2 Winning Projects)

### 🥈 2nd Place: **Flow**
- **Event:** Monad Blitz Lagos | **Category:** `Payments`
- **Builders:** Oladipo Evagel, Olojede Jahnifemi, Akinwamide Bukunmi
- **Core Mechanic & Idea:** Flow is a decentralized, peer-to-peer protocol that enables per-second value streaming. Using Monad’s 400ms block times, we’ve built a trustless "Live Meter." Money moves from the payer to the payee block-by-block. No middlemen, no commissions, and zero payment latency.  This particular implementation uses uber(booking a ride) as case study
- **Links:** [🌐 Live Demo](https://github.com/Evangel90/monad-blitz-lagos) · [💻 GitHub Repository](https://github.com/Evangel90/monad-blitz-lagos) · [🐦 Video / Tweet](https://x.com/heis_nifeee/status/2042971030767935625?s=46)

### 🥉 3rd Place: **DeLeak**
- **Event:** Monad Blitz İzmir | **Category:** `Cyber Security`
- **Builders:** ismail
- **Core Mechanic & Idea:** DeLeak, Monad Üzerinde Vibe Coderlar için data security sağlayan, kötü amaçların botların aksine private key gibi kritik anahtarları yakalayıp doğrulama ile kullanıcılara tekrardan varlıklarına ulaşma fırsatı verir.
- **Links:** [🌐 Live Demo](https://deleak.vercel.app/) · [💻 GitHub Repository](https://github.com/justbiar/Deleak) · [🐦 Video / Tweet](https://x.com/justbiar/status/2037893853127061581?s=48)

---

## 🚀 Consumer Apps, SocialFi & Digital Identity (4 Winning Projects)

### 🥇 1st Place: **Unbubble**
- **Event:** Monad Blitz@惠州Mojo | **Category:** `Social / Algorithmic Feed`
- **Builders:** 每每
- **Core Mechanic & Idea:** An open recommendation algorithm experiment on Monad helping users break out of information silos by contrasting traditional engagement feeds with open transparent feeds.
- **Links:** [🌐 Live Demo](https://unbubble-nu.vercel.app/) · [💻 GitHub Repository](https://github.com/everyeveryV/unbubble) · [🐦 Video / Tweet](https://mojo.devnads.com/projects/398)

### 🥇 1st Place: **CREU CREU**
- **Event:** Test Brazil - Bernardo | **Category:** `CREU`
- **Builders:** GABRIEL BIRIMBAL TESTE
- **Core Mechanic & Idea:** CREU CREUCREU CREUCREU CREUCREU CREUCREU CREU
- **Links:** [🌐 Live Demo](https://www.amazon.com.br/) · [💻 GitHub Repository](https://github.com/bnb-chain/community-contributions/blob/main/2025/2025h2.md) · [🐦 Video / Tweet](https://x.com/OneMorePeter)

### 🥈 2nd Place: **projet aura farming**
- **Event:** Monad Blitz Paris | **Category:** `aura farm`
- **Builders:** ilan
- **Core Mechanic & Idea:** notation de vidéos à caractère ludique
- **Links:** [🌐 Live Demo](https://github.com/ilil20/hackathon) · [💻 GitHub Repository](https://github.com/ilil20/hackathon)

### 🥈 2nd Place: **TESTE**
- **Event:** Test Brazil - Bernardo | **Category:** `TESTE`
- **Builders:** Gabriel de Pinho
- **Core Mechanic & Idea:** TESTE
- **Links:** [🌐 Live Demo](https://teste.com) · [💻 GitHub Repository](https://github.com/bnb-chain/community-contributions/issues) · [🐦 Video / Tweet](https://x.com/Ethereum_Brasil)

---

## 🎯 How to Beat Previous Winners at Monad Blitz Berlin

To score higher than the historical winners above, design your project along these vector dimensions:

| Dimension | Average Project | Winning Project | Championship Monad Build |
| :--- | :--- | :--- | :--- |
| **Transaction Flow** | Standard manual metamask popups | Batch transactions via multicall3 | **Autonomous AI Agents using x402 Facilitator + Zero-gas off-chain signing** |
| **Speed & Finality** | Slow poll loop with `waitForTransaction` | standard 0.3s block tracking | **Instant synchronous UI updates using `eth_sendRawTransactionSync` + node WebSocket events** |
| **Contract Complexity** | Splitting into diamonds / proxies due to 24KB limit | Standard ERC contracts | **Monolithic 128 KB smart contracts handling heavy business logic in a single deployment** |
| **Room Interaction** | Single-user dashboard demo | 2-player interaction | **Room-wide simultaneous live interaction taking advantage of 10,000 TPS** |
| **Pitch Format** | 5 minutes of slide explanations | 2 min slides, 1 min demo | **"Problem in one breath, 2.5 minutes of flawless live demo on public URL"** |
