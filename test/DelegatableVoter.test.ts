import { ethers } from "hardhat";
import { Contract, ContractFactory, utils, Wallet } from "ethers";

/**
 * \Owner can make a proposal (no delegation)
User A can vote on an active proposal (no delegation)
Owner can issue a delegation to User A to make a proposal
User A can issue a delegation to User B to vote on User A’s behalf
User A can issue a delegation to User B who re-delegates it to User C to vote on User A’s behalf
Delegation with the Allowed Methods caveat enforcer to restrict what method User B can call
Delegation with the Block Number caveat enforcer to restrict when User B can use the delegation
 */

