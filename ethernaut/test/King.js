const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KingAttacker", function () {
  let accounts, eoa, attacker, challenge;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [eoa] = accounts;

    // Deploy the challenge contract
    const challengeFactory = await ethers.getContractFactory("King");
    challenge = await challengeFactory.deploy({
      value: ethers.utils.parseUnits("1", "ether"),
    });
    await challenge.deployed();

    // Deploy the attacker contract
    const attackerFactory = await ethers.getContractFactory("KingAttacker");
    attacker = await attackerFactory.deploy(challenge.address);
    await attacker.deployed();
  });

  it("solves the challenge", async function () {
    const tx = await attacker.attack({
      value: ethers.utils.parseUnits("1", "ether"),
    });
    await tx.wait();

    expect(await challenge._king()).to.equal(attacker.address);
  });
});
