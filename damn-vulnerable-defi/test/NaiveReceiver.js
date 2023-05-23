const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Naive Receiver Challenge Test", function () {
  let deployerAccount, userAccount, playerAccount;
  let lenderPool, flashLoanReceiver;

  // Initial balance of the lender pool is 1000 ETH
  const INITIAL_POOL_BALANCE = 1000n * 10n ** 18n;

  // Initial balance of the flash loan receiver is 10 ETH
  const INITIAL_RECEIVER_BALANCE = 10n * 10n ** 18n;

  before(async function () {
    // Setup accounts
    [deployerAccount, userAccount, playerAccount] = await ethers.getSigners();

    // Deploy the lender pool contract and fund it with 1000 ETH
    const LenderPoolContractFactory = await ethers.getContractFactory(
      "NaiveReceiverLenderPool",
      deployerAccount
    );
    lenderPool = await LenderPoolContractFactory.deploy();
    await deployerAccount.sendTransaction({
      to: lenderPool.address,
      value: INITIAL_POOL_BALANCE,
    });
    const ETH = await lenderPool.ETH();

    // Check initial state of the lender pool
    expect(await ethers.provider.getBalance(lenderPool.address)).to.be.equal(
      INITIAL_POOL_BALANCE
    );
    expect(await lenderPool.maxFlashLoan(ETH)).to.eq(INITIAL_POOL_BALANCE);
    expect(await lenderPool.flashFee(ETH, 0)).to.eq(10n ** 18n);

    // Deploy the flash loan receiver contract and fund it with 10 ETH
    const FlashLoanReceiverContractFactory = await ethers.getContractFactory(
      "FlashLoanReceiver",
      deployerAccount
    );
    flashLoanReceiver = await FlashLoanReceiverContractFactory.deploy(
      lenderPool.address
    );
    await deployerAccount.sendTransaction({
      to: flashLoanReceiver.address,
      value: INITIAL_RECEIVER_BALANCE,
    });
    await expect(
      flashLoanReceiver.onFlashLoan(
        deployerAccount.address,
        ETH,
        INITIAL_RECEIVER_BALANCE,
        10n ** 18n,
        "0x"
      )
    ).to.be.reverted;
    expect(await ethers.provider.getBalance(flashLoanReceiver.address)).to.eq(
      INITIAL_RECEIVER_BALANCE
    );
  });

  // Exploit the naive receiver by draining all its funds
  it("Exploit", async function () {
    // Deploy the attack contract
    const AttackContractFactory = await ethers.getContractFactory(
      "AttackNaiveReceiver",
      playerAccount
    );
    const attackContract = await AttackContractFactory.deploy(
      lenderPool.address
    );

    // Execute the attack
    await attackContract.attack(flashLoanReceiver.address);
  });

  after(async function () {
    // Check if the exploit was successful
    expect(
      await ethers.provider.getBalance(flashLoanReceiver.address)
    ).to.be.equal(0);
    expect(await ethers.provider.getBalance(lenderPool.address)).to.be.equal(
      INITIAL_POOL_BALANCE + INITIAL_RECEIVER_BALANCE
    );
  });
});
