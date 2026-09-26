# Monad Ecosystem Tools — Full Reference

Compiled from Monad's official documentation (docs.monad.xyz/tooling-and-infra) as of September 2026. Monad is fully EVM-bytecode-compatible, so standard Ethereum tooling (Hardhat, Foundry, Remix, ethers.js/viem, MetaMask) works out of the box — everything below is either Monad-specific infrastructure or a general EVM tool with confirmed Monad support.

---

## 1. Development Toolkits

| Tool | Description |
|---|---|
| **Foundry** | Rust-based toolchain (Forge/Cast/Anvil) for building, testing, deploying, and debugging Solidity contracts on Monad. Most winning hackathon projects use this for their test suites. |
| **Hardhat** | JavaScript/TypeScript-based development environment; Hardhat 3 has first-class Monad project support. |
| **Remix** | Browser-based IDE for quick contract deployment and testing without local setup — good for very fast prototyping. |
| **Monad Solonet** | Run a complete local Monad network in Docker, for testing node operations and validator workflows offline. |
| **Scaffold-ETH** | Full-stack dApp starter kit (contracts + frontend) with a documented guide for Monad. |

---

## 2. RPC Providers

Managed JSON-RPC endpoints so you don't have to run your own node.

| Provider | Notes |
|---|---|
| **Alchemy** | Popular API platform; generous free tier, hosted testnet nodes. |
| **Ankr** | Public/private RPC via a globally distributed node network. |
| **QuickNode** | Managed, high-performance endpoints; also offers Streams (real-time event pipelines). |
| **Chainstack** | Low-latency, geo-balanced endpoints; early to support Monad's archive/trace mode. |
| **Blockdaemon** | Enterprise infra — dedicated nodes, staking, MPC wallets. |
| **BlockPI** | High-performance RPC at below-market pricing. |
| **BoltRPC** | HTTPS/WebSocket RPC with transparent request-unit pricing. |
| **dRPC NodeCloud** | Low-latency RPC, free tier + paid plans from $10. |
| **Dwellir** | Flat-rate pricing (no compute-unit accounting), 100+ networks supported. |
| **Envio (HyperRPC)** | Free, performant *read-only* RPC for data-intensive queries; supports up to 10,000 blocks of history. |
| **GetBlock** | Shared and dedicated node access. |
| **Node101** | Dedicated infra with JSON-RPC + trace API support and 24/7 support. |
| **OnFinality** | 99.99% uptime SLA, cross-chain support. |
| **Spectrum** | Enterprise dedicated endpoints across 150+ networks. |
| **Tatum** | RPC + blockchain data + real-time notifications in one platform. |
| **thirdweb (RPC Edge)** | RPC bundled with thirdweb's broader dev platform. |
| **Triton One** | Built for consistent performance under high load. |
| **Validation Cloud** | Claims fastest node provider (per Compare Nodes); 50M free compute units, no rate limits on scale tier. |

---

## 3. Block Explorers & Transaction Analysis

| Tool | Description |
|---|---|
| **Monadscan** | Etherscan-built explorer — the closest thing to "the" default explorer; has a contract-verification API. |
| **MonadVision** | Explorer by BlockVision, with Sourcify contract verification, indexing APIs, and validator services. |
| **JiffyScan** | Explorer specifically for ERC-4337 UserOperations (account-abstraction transactions). |
| **Tenderly Explorer** | Deep transaction analyzer — call stack, balance changes, gas usage, plus a full debugging/simulation toolkit. |
| **Blocksec Phalcon Explorer** | Similar deep transaction analysis — fund flows, invocation trees, state changes; popular for security research. |

---

## 4. Oracles

Bring off-chain data (mainly prices) on-chain.

| Provider | Type | Notes |
|---|---|---|
| **Pyth Network** | Pull oracle + VRF | 400ms latency, first-party data from financial institutions; the most-used oracle in Blitz hackathon winners (WICK, AgMON). Has a live MON/USD feed. |
| **Chainlink** | Push (Price Feeds) + Pull (Data Streams) | The industry-standard oracle; also offers CCIP for cross-chain messaging. |
| **RedStone** | Push + pull | Specializes in yield-bearing collateral (LSTs, LRTs, BTCFi) — used in the winning project echonad. |
| **Supra** | Push + pull + dVRF | Also provides verifiable random function for gaming/lottery use cases. |
| **Stork** | Pull oracle | Sub-second latency, aggregates from trusted publishers. |
| **Chronicle** | Push + custom | Originally built for MakerDAO/DAI; 60–80% more gas-efficient than typical oracles via Schnorr signatures. |
| **Gelato VRF** | VRF (testnet) | Verifiable randomness for fair on-chain outcomes. |

---

## 5. Indexers

### Data for Common Use Cases (hosted, no custom code needed)
Balances, transfers, DEX trades, market data — via API or streaming. See Monad's docs for the current provider list (Envio, Goldsky, QuickNode Streams, Dune, Chainbase, and others all offer this).

### Indexing Frameworks (build custom indexers)

| Provider | Language | Known for |
|---|---|---|
| **Envio (HyperIndex)** | JS/TS/Rescript | Performance and scale; also offers HyperSync for near-instant historical syncing. |
| **Ghost (GhostGraph)** | Solidity | Write indexers in the same language as your contracts — no context switching. |
| **Goldsky** | AssemblyScript/SQL/TS | Real-time data streaming via Subgraphs or Turbo Pipelines straight into your own DB. |
| **The Graph** | AssemblyScript | The original subgraph indexer; fully decentralized hosting available. |
| **SQD** | TypeScript | Decentralized, cost-efficient access to petabytes of historical on-chain data. |
| **Sentio** | JS/TS | Native processors plus built-in dashboards and alerting. |
| **Ormi** | AssemblyScript | Sub-second latency subgraphs and data APIs. |
| **Streamingfast (Substreams)** | Rust | Composable Rust modules; outputs to Postgres, MongoDB, Kafka, etc. |
| **SubQuery** | TypeScript | Multi-chain aggregation in a single project (useful for cross-chain dashboards). |

---

## 6. Wallets (User-Facing)

Monad works with nearly every EVM wallet. Selected notable ones (all support Mainnet + most support Testnet):

| Wallet | Notable for |
|---|---|
| **MetaMask** | The default — native Monad support, in-wallet swap/bridge. |
| **Rabby** | Auto network detection + transaction simulation with risk alerts. |
| **Rainbow** | Polished UX, hardware wallet support, multi-wallet management. |
| **Trust Wallet** | Massive multi-chain/asset support. |
| **OKX / Binance / Bitget Wallet** | Exchange-native wallets with built-in DApp browsers and swaps. |
| **Backpack** | Wallet + exchange hybrid (futures trading, portfolio tracking). |
| **Zerion** | Best-in-class DeFi portfolio tracking layered on a self-custodial wallet. |
| **Ambire** | Smart accounts (EIP-7702), open source, "Gas Tank" for prepaid gas. |
| **Infinex** | Passkey login (no seed phrase), spot/perps trading built in. |
| **Uniswap Wallet** | Built-in bridging and swaps for Uniswap users. |
| **Safepal / Exodus / Coin98 / imToken / Keplr** | Additional multi-chain options with varying NFT/DeFi feature sets. |

---

## 7. Wallet Infrastructure (Build Your Own Wallet UX)

For teams embedding wallets directly into an app rather than relying on the user's own extension.

### Embedded Wallets (email/social/passkey login, no seed phrase)

| Provider | Security model | Notable |
|---|---|---|
| **Privy** | TEE + Shamir's Secret Sharing | **Subsidizing all Monad Testnet usage** — email `monad@privy.io`. Used in several Blitz winners. |
| **Turnkey** | TEE | **Free for Monad Testnet.** Also does session keys/policy-based signing for autonomous agents (used by Ava). |
| **Para** | MPC + DKG | **Free for Monad Testnet** — email `ops@getpara.com`. Cross-app wallets that work across EVM/Solana/Cosmos. |
| **Dynamic** | TEE + TSS-MPC | Passkey/social/email login. |
| **Coinbase Developer Platform (CDP)** | Device secure enclaves | Embedded wallets + payments in one platform. |
| **Alchemy (Account Kit)** | — | Full account-abstraction stack — smart wallets, gas sponsorship, bundler APIs. |
| **thirdweb** | — | Client SDKs for onboarding + onramps/swaps/bridging in one package. |
| **Sequence** | TEE, Sandboxed Smart Sessions | Originator of ERC-1271/ERC-6492; strong for gaming (Unity/Unreal SDKs). |
| **Crossmint** | Device secure enclave | Wallets for users *and* AI agents from one SDK. |
| **Cubist (CubeSigner)** | HSM + AWS Nitro Enclaves | Hardware-backed keys that never leave secure enclaves. |
| **Mera** | Passkey-derived (WebAuthn PRF) | Free & open source — standard BIP-44 EOAs derived from Face ID/Touch ID, no server custody. |
| **Fordefi / Portal / Openfort** | MPC / TSS-MPC / SSS | More specialized options (DeFi policy controls, stablecoin infra, backend wallets respectively). |
| **Reown (formerly WalletConnect)** | — | The standard "connect wallet" UI component, plus its own embedded wallet option. |

**Session keys** (a feature several of these support) are worth flagging specifically: scoped keys that let an app or AI agent act on a user's behalf without repeated sign prompts — the pattern behind Ava and other autonomous-agent hackathon winners.

---

## 8. Agentic Payments (x402 & Machine-to-Machine)

The category most Blitz hackathon winners have built on.

| Tool | Description |
|---|---|
| **Monad x402 Facilitator** | Hosted service implementing the x402 protocol (HTTP 402 "Payment Required" made real). Handles verification and on-chain settlement, **covers gas fees for you**, works with USDC. Endpoint: `https://x402-facilitator.molandak.org`. This is the single most-reused tool across winning agent/payment projects (Meterrail, Monacle, Ava, DinnerNode). |
| **MPP SDK (`@monad-crypto/mpp`)** | TypeScript library for the Machine Payments Protocol — programmatic construction/management of payment transactions. |

---

## 9. DEX Aggregators

Route swaps across multiple liquidity venues for best execution.

| Provider | Notes |
|---|---|
| **Monorail** | Monad-native — unifies AMM, order-book, and RFQ liquidity into one router. |
| **Moose** | Monad-native, built by the FastLane team; fully on-chain routing (protects against quote spoofing). |
| **Kuru Flow** | Smart router across Monad's ecosystem including Kuru's own order-book DEX. |
| **1inch** | Full API suite (swap, price, portfolio, gas) live on Monad. |
| **0x / Matcha** | Swap API + a consumer-facing swap product. |
| **KyberSwap** | Aggregator API + embeddable widget. |
| **LI.FI** | Unified API across DEX aggregators *and* bridges, plus a drop-in widget. |
| **SushiSwap (Route Processor)** | Aggregation exposed as an API. |
| **Enso** | Bundles multi-protocol DeFi actions behind one API call. |
| **Eisen Finance / Fibrous / Dirol / fly.trade / Rango** | Additional aggregators with varying routing engines — check DefiLlama's Monad aggregator page for live volume comparisons. |

---

## 10. Cross-Chain (Bridges & Interoperability)

Moving assets/messages between Monad and other chains. Definitions: **AMB** (arbitrary message bridge), **Token Bridge** (lock-and-mint), **Intents Bridge/Liquidity Layer** (faster, pool-based), **Bridge Aggregator**, **Chain Abstraction** (hides all of the above from the user).

| Provider | Bridge type |
|---|---|
| **Wormhole / Portal** | AMB + Native Token Transfers — access to 30+ chains. |
| **LayerZero** | AMB + Token Bridge — 35+ chains. |
| **Chainlink CCIP** | AMB + Token Bridge, backed by Chainlink's oracle network. |
| **Circle CCTP** | Native USDC burn-and-mint bridge — best option specifically for USDC. |
| **Axelar** | AMB + Token Bridge, connects 49+ chains. |
| **deBridge / Across / Stargate / Squid / Relay** | Intents bridges / liquidity layers — faster than waiting for full AMB finality. |
| **Garden / Flashnet** | Bitcoin-specific bridges (trustless BTC swaps in 10–30 seconds). |
| **Particle Network / Socket / Trustware** | Chain abstraction — let users deposit/act from any chain without manually bridging. |
| **Bungee / Li.fi / Rango / Jumper / DZap** | Bridge aggregators — route across multiple bridges automatically. |

---

## 11. Analytics & Security

| Tool | Description |
|---|---|
| **Dune** | SQL-based dashboards and datasets — the standard for public on-chain analytics. |
| **DeFiLlama** | Open-source TVL and DeFi analytics across protocols. |
| **Nansen** | Wallet labeling + "smart money" tracking. |
| **Tenderly** | Virtual testnets, debugger, simulator — also useful *during development*, not just post-launch. |
| **Blockaid** | Real-time fraud/exploit detection for builders. |
| **Chainalysis (+ Hexagate)** | Compliance, investigations, and real-time threat detection. |
| **CoinGecko** | Price/market data API, on-chain DEX data across 250+ chains. |
| **Bubblemaps** | Visual wallet/fund-flow investigation tool. |
| **Flipside** | Free, AI-assisted on-chain analytics. |
| **TRM Labs / Elliptic** | Blockchain intelligence for compliance and risk. |

---

## 12. Other Categories (see docs.monad.xyz for full provider lists)

Monad's docs also maintain dedicated pages for:
- **Custody** — institutional-grade asset custody providers
- **Onramps** — fiat-to-crypto entry points
- **Privacy** — privacy-preserving transaction tooling
- **Card Issuing** — crypto-linked card programs
- **Payment Orchestrators** — routing/managing payments across rails
- **Earn/Yield Infrastructure** — yield-generating protocols and vaults
- **Account Abstraction Providers** & **Smart Account Implementations** — deeper AA tooling beyond embedded wallets
- **Hardware / Institutional / Multisig Wallets** — Ledger, Trezor, Fireblocks-style custody, Safe, etc.

---

## Quick-Start Stack Recommendation

If you're building fast (e.g., at a hackathon) and want the highest-leverage combination:

**Foundry** (contracts + tests) + **Next.js** (frontend) + **MetaMask/Privy** (wallet) + **Pyth** (prices) + **Monad x402 Facilitator** (payments) + **Monadscan** (verify/share your deployed contract) + **Vercel** (instant hosting).

This combination alone covers the technical foundation of the large majority of winning Monad Blitz hackathon projects.

*Source: [docs.monad.xyz/tooling-and-infra](https://docs.monad.xyz/tooling-and-infra) — check there for the most current provider lists, as this ecosystem is expanding quickly.*