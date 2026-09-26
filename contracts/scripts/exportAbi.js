const fs = require("fs");
const path = require("path");

const artifactPath = path.join(__dirname, "../artifacts/contracts/DracarysEscrow.sol/DracarysEscrow.json");
if (!fs.existsSync(artifactPath)) {
  console.error("Artifact not found. Run npx hardhat compile first.");
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const exportDir = path.join(__dirname, "../export");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

const tsContent = `// Dracarys Contract Configuration for Monad Testnet (Chain ID 10143)
export const DRACARYS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // Updates upon live deploy
export const DRACARYS_CHAIN_ID = 10143 as const;
export const DRACARYS_RPC_URL = "https://testnet-rpc.monad.xyz" as const;

export const DRACARYS_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;
`;

fs.writeFileSync(path.join(exportDir, "dracarysContract.ts"), tsContent);
console.log("🔥 Successfully generated contracts/export/dracarysContract.ts with ABI!");
