const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🐉 Starting DracarysEscrow deployment on Monad Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error("❌ No deployer account configured. Set PRIVATE_KEY in your .env file.");
    process.exit(1);
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`📡 Deployer Address: ${deployer.address}`);
  console.log(`💰 Deployer Balance: ${hre.ethers.formatEther(balance)} MON`);

  // Deploy DracarysEscrow
  const DracarysEscrow = await hre.ethers.getContractFactory("DracarysEscrow");
  console.log("⏳ Deploying DracarysEscrow contract to Monad...");
  const dracarys = await DracarysEscrow.deploy();
  await dracarys.waitForDeployment();

  const contractAddress = await dracarys.getAddress();
  const txHash = dracarys.deploymentTransaction()?.hash;

  console.log("\n========================================================");
  console.log(`🔥 DracarysEscrow successfully deployed to Monad Testnet!`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Transaction Hash: ${txHash}`);
  console.log(`🌐 MonadVision Link: https://testnet.monadvision.com/address/${contractAddress}`);
  console.log("========================================================\n");

  // Read ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DracarysEscrow.sol/DracarysEscrow.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Save deployment metadata
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const deploymentData = {
    network: "monadTestnet",
    chainId: 10143,
    address: contractAddress,
    txHash: txHash,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "monadTestnet.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Generate frontend ready TypeScript export
  const exportDir = path.join(__dirname, "../export");
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  const tsContent = `// Auto-generated Dracarys Contract Configuration for Monad Testnet
export const DRACARYS_CONTRACT_ADDRESS = "${contractAddress}" as const;
export const DRACARYS_CHAIN_ID = 10143 as const;
export const DRACARYS_RPC_URL = "https://testnet-rpc.monad.xyz" as const;

export const DRACARYS_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;
`;

  fs.writeFileSync(path.join(exportDir, "dracarysContract.ts"), tsContent);
  console.log(`📦 Saved frontend export to: contracts/export/dracarysContract.ts`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
