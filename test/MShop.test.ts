import {loadFixture, expect, ethers} from './scripts'
import tokenJSON from '../artifacts/contracts/ERC20.sol/MCSToken.json'

describe("MShop", function () {
    async function deploy() {
        const [owner, buyer] = await ethers.getSigners();
        
        const MShop = await ethers.getContractFactory("MShop", owner);
        const shop = await MShop.deploy();
        await shop.waitForDeployment();

        const erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner);
        console.log(await shop.getAddress());
        console.log(await shop.token());
        
        
        return {owner, buyer, shop, erc20};
    }

    it("should have an owner and a token", async function() {
        const {owner, shop} = await loadFixture(deploy);

        expect(await shop.owner()).to.eq(owner.address);

        expect(await shop.token()).to.be.properAddress;
    })

    it("allows to buy", async function(){
        const {buyer, shop, erc20} = await loadFixture(deploy);

        const tokenAmount = 3;

        const txData = {
            value: tokenAmount,
            to: await shop.getAddress()
        }

        const tx = await buyer.sendTransaction(txData);
        await tx.wait();

        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount);
    
        await expect(tx).to.changeEtherBalance(shop, tokenAmount);

        await expect(tx).to
            .emit(shop, "Bought")
            .withArgs(tokenAmount, buyer.address)
    })

    it("allows to sell", async function(){
        const {buyer, shop, erc20} = await loadFixture(deploy);

        const tokenAmount = 3;

        const txData = {
            value: tokenAmount,
            to: await shop.getAddress()
        }

        const tx = await buyer.sendTransaction(txData);
        await tx.wait();

        const sellAmount = 2;

        const approval = await erc20.connect(buyer).approve(await shop.getAddress(), sellAmount);
        
        await approval.wait();

        const sellTx = await shop.connect(buyer).sell(sellAmount);

        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount - sellAmount);
    
        await expect(sellTx).to.changeEtherBalance(shop, -sellAmount);

        await expect(sellTx).to
            .emit(shop, "Sold")
            .withArgs(sellAmount, buyer.address)
    })
})