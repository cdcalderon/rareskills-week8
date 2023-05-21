const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial Challenge", function () {
  let accounts;
  let eoa;
  let attacker;
  let challenge; // challenge contract
  let tx;

  before(async () => {
    accounts = await ethers.getSigners();
    [eoa] = accounts;

    // Deploy the challenge contract
    const Denial = await ethers.getContractFactory("Denial");
    challenge = await Denial.deploy();
    await challenge.deployed();

    // Deploy the attacker contract
    const DenialAttacker = await ethers.getContractFactory("DenialAttacker");
    attacker = await DenialAttacker.deploy(challenge.address);
    await attacker.deployed();
  });

  it("solves the challenge", async function () {
    tx = await attacker.attack();
    await tx.wait();
  });

  after(async () => {
    // Check if the challenge is solved
    expect(await challenge.partner(), "level not solved").to.equal(
      attacker.address
    );
  });
});
