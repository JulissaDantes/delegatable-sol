import { ethers } from "hardhat";
import { Contract, ContractFactory, utils, Wallet } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Provider } from "@ethersproject/providers";
const { getSigners } = ethers;

describe("DelegatableVoter", () => {
    const CONTACT_NAME = "DelegatableVoter";
    let CONTRACT_INFO: any;
    let delegatableUtils: any;
    let signer0: SignerWithAddress;
    let wallet0: Wallet;
    let wallet1: Wallet;

    let DelegatableVoter: Contract;
    let DelegatableVoterFactory: ContractFactory;

    before(async () => {
        [signer0] = await getSigners();
        [wallet0, wallet1] = getPrivateKeys(
          signer0.provider as unknown as Provider
        );
        DelegatableVoterFactory = await ethers.getContractFactory("DelegatableVoter");

    });

    it("Owner can make a proposal (no delegation)", async () => {

    });

    it("User A can vote on an active proposal (no delegation)", async () => {
        
    });

    it("Owner can issue a delegation to User A to make a proposal", async () => {

    });

    it("User A can issue a delegation to User B to vote on User A’s behalf", async () => {
        
    });

    it("User A can issue a delegation to User B who re-delegates it to User C to vote on User A’s behalf", async () => {

    });

    it("Delegation with the Allowed Methods caveat enforcer to restrict what method User B can call", async () => {
        
    });

    it("Delegation with the Block Number caveat enforcer to restrict when User B can use the delegation", async () => {
        
    });
    
}