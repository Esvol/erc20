import { ethers } from "hardhat";

async function main() {
  const [owner, buyer] = await ethers.getSigners();
        
  const MShop = await ethers.getContractFactory("MShop", owner);
  const shop = await MShop.deploy();
  await shop.waitForDeployment();

  console.log(await shop.getAddress());
  console.log(await shop.token());
       
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
