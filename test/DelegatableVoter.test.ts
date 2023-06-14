import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory, utils, Wallet } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getPrivateKeys } from "../utils/getPrivateKeys";
// @ts-ignore
import { generateUtil } from "eth-delegatable-utils";
import { Provider } from "@ethersproject/providers";
import { it } from "mocha";
import { generateDelegation } from "./utils";
const { getSigners } = ethers;

describe.only("DelegatableVoter", () => {
  const CONTACT_NAME = "DelegatableVoter";
  let CONTRACT_INFO: any;
  let delegatableUtils: any;
  let signer0: SignerWithAddress;
  let walletOwner: Wallet;
  let walletA: Wallet;
  let walletB: Wallet;
  let walletC: Wallet;
  let pk0: string;
  let pk1: string;
  let pk2: string;

  let DelegatableVoter: Contract;
  let DelegatableVoterFactory: ContractFactory;

  before(async () => {
    [signer0] = await getSigners();
    [walletOwner, walletA, walletB, walletC] = getPrivateKeys(
      signer0.provider as unknown as Provider
    );
    DelegatableVoterFactory = await ethers.getContractFactory(
      "DelegatableVoter"
    );
    DelegatableVoter = await DelegatableVoterFactory.connect(
      walletOwner
    ).deploy();
    pk0 = walletOwner._signingKey().privateKey;
    pk1 = walletA._signingKey().privateKey;
    pk2 = walletB._signingKey().privateKey;
    CONTRACT_INFO = {
      chainId: DelegatableVoter.deployTransaction.chainId,
      verifyingContract: DelegatableVoter.address,
      name: CONTACT_NAME,
    };
    delegatableUtils = generateUtil(CONTRACT_INFO);
  });

  it("Owner can make a proposal (no delegation)", async () => {
    const proposal = "proposal a";
    const expiration = await ethers.provider.getBlockNumber();
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["string"], [proposal])
    );

    const result = await DelegatableVoter.propose(proposal, expiration);

    expect(
      await DelegatableVoter.callStatic.propose(proposal, expiration)
    ).to.eq(hash);
  });

  it("User A can vote on an active proposal (no delegation)", async () => {
    const proposal = "proposal b";
    const expiration = await ethers.provider.getBlockNumber();
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["string"], [proposal])
    );
    const proposalId = await DelegatableVoter.propose(proposal, expiration + 5);

    await DelegatableVoter.connect(walletA).vote(
      proposalId,
      true,
      walletA.address,
      null
    );

    expect(await DelegatableVoter.proposals[hash].voters(walletA.address)).to.be
      .true;
    expect(await DelegatableVoter.proposals[hash].supportVotes).to.eq(1);
  });

  it("Owner can issue a delegation to User A to make a proposal", async () => {
    const proposal = "proposal c";
    const expiration = (await ethers.provider.getBlockNumber()) + 5;
    const _delegation = generateDelegation(
      CONTACT_NAME,
      DelegatableVoter,
      pk0,
      walletA.address
    );
    await DelegatableVoter.connect(walletA).delegateProposal(
      proposal,
      expiration + 5,
      _delegation
    );
  });

  it("User A can issue a delegation to User B to vote on User A behalf", async () => {
    const proposal = "proposal d";
    const expiration = (await ethers.provider.getBlockNumber()) + 5;
    await DelegatableVoter.propose(proposal, expiration);
    const proposalId = await DelegatableVoter.propose(proposal, expiration + 5);
    const _delegation = generateDelegation(
      CONTACT_NAME,
      DelegatableVoter,
      pk1,
      walletB.address
    );
    await DelegatableVoter.connect(walletB).vote(
      proposalId,
      true,
      walletA.address,
      null
    );
  });

  it("User A can issue a delegation to User B who re-delegates it to User C to vote on User A behalf", async () => {
    const _delegation = generateDelegation(
      CONTACT_NAME,
      DelegatableVoter,
      pk1,
      walletB.address
    );
  });

  it("Delegation with the Allowed Methods caveat enforcer to restrict what method User B can call", async () => {});

  it("Delegation with the Block Number caveat enforcer to restrict when User B can use the delegation", async () => {});
});
