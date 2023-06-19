//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../Delegatable.sol";

contract DelegatableVoter is Ownable, Delegatable("DelegatableVoter", "1") {
    // TBD EVENTS
    struct Proposal {
        uint256 supportVotes;
        uint256 againstVotes;
        uint256 expiration;
        mapping(address => bool) voters;
    }

    mapping(bytes32 => Proposal) public proposals;
    // Prevents signature replay is true it was used
    mapping(SignedDelegation => bool) usedSignatures;

    /* Only the owner of the contract is be able to create new proposals.
     * A proposal consists of a short string description and an expiration time (measured in block numbers).
     * `expirationBlock` must be the block number when it expires.
     * Returns the proposal hash.
     */
    function propose(string memory description, uint256 expirationBlock)
        external
        onlyOwner
        returns (bytes32)
    {
        return _propose(description, expirationBlock);
    }

    /*
     * The contract owner should be able to issue off-chain delegations to other users to create proposals on their behalf.
     */
    function delegateProposal(
        string memory description,
        uint256 expirationBlock,
        SignedDelegation memory signedDelegation
    ) external returns (bytes32) {
        require(
            !usedSignatures(signedDelegation)&&
            verifyDelegationSignature(signedDelegation) == owner(),
            "Invalid delegation"
        );
        return _propose(description, expirationBlock);
    }

    function _propose(string memory description, uint256 expirationBlock)
        internal
        returns (bytes32)
    {
        bytes32 proposal = keccak256(abi.encodePacked(description));
        require(
            proposals[proposal].expiration == 0,
            "Proposal already created"
        );
        require(expirationBlock > 0, "Invalid expiration time");
        // Saving hash instead of string to be more gas efficient
        proposals[proposal].expiration = expirationBlock;
        return proposal;
    }

    /* Any user is be able to vote for proposals that are active. Each user has only one vote per active proposal.
     * Users should be able to issue off-chain delegations to other users to vote on a proposal on their behalf.
     *  If user supports proposal `vote` should be `true`.
     *  If `voter` is not the message sender is a delegation.
     */
    function vote(
        bytes32 _proposal,
        bool voteValue,
        address voter,
        SignedDelegation memory signedDelegation
    ) external {
        // Needs to be in storage due too nested mapping
        Proposal storage proposal = proposals[_proposal];
        require(proposal.expiration >= block.number, "Closed proposal");
        require(
            msg.sender == voter || (!usedSignatures(signedDelegation) &&
                verifyDelegationSignature(signedDelegation)) == voter,
            "Invalid delegation"
        );
        require(!proposal.voters[voter], "Already voted");
        if (voteValue) {
            proposal.supportVotes += 1;
        } else {
            proposal.againstVotes += 1;
        }
    }

    /* When the proposal expires (the current block number is greater than the proposal's expiration), no more votes can be cast for that proposal.
     * There should be a function to count the votes and declare the final result. ie Approved or Rejected
     * Returns `true` if Approved, and `false` if Rejected.
     */
    function count(bytes32 _proposal) external returns (bool) {
        // Needs to be in storage due too nested mapping
        Proposal storage proposal = proposals[_proposal];
        require(proposal.expiration < block.number, "Active proposal");
        return proposal.supportVotes > proposal.againstVotes;
    }

    /* Override needed */
    function _msgSender()
        internal
        view
        override(DelegatableCore, Context)
        returns (address sender)
    {
        return super._msgSender();
    }
}
