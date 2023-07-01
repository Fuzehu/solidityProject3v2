// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/** 
* @title Voting contract
* @author Nicolas Foti
* @notice This contract can be used for only 1 vote (no reset function included)
*/

contract Voting is Ownable {

    uint public winningProposalID;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        // VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    
    /// @notice OnlyVoters modifier, allowing interactions from voters only
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, 'You are not a resgistered voter');
        _;
    }
    

    // ::::::::::::: GETTERS ::::::::::::: //

    /**
    * @notice Get Voter informations (struct) from his address, usable only by Voters
    * @param _addr Voter's address
    * @return Voter Voter struct
    */
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /**
    * @notice Get one proposal description from its ID, usable only by Voters
    * @param _id Proposal ID
    * @return Proposal Corresponfing proposal description
    */
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /**
    * @notice Add voter to whitelist from his address, usable only by Voters
    *         Can only be used during the RegisteringVoters workflowStatus
    * @dev Add a voter in Voters struct from voters mapping 
    *      Emit VoterRegistered event
    * @param _addr Voter address
    */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /**
    * @notice Add a specific voter's ('msg.sender') proposal to the voting session, usable only by Voters
    *         Can only be used during the ProposalsRegistrationStarted workflowStatus
    *         No empty proposal description is allowed
    * @dev Add voter's proposal in the proposalsArray
    *      Emit VoterRegistered event
    * @param _desc Proposal description
    */
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Empty proposal are not allowed'); 

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /* ORIGINAL setVote FUNCTION
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }
    */

    /** 
    * @notice Set voter's ('msg.sender') vote, usable only by Voters
    *         Can only be used during the VotingSessionStarted workflowStatus
    *         Can only be used once by each voter as a voter only get 1 vote
    *         Voted proposal ID must be attributed to an existing registered proposal
    * @dev Set voter's vote by incrementing the voted proposal vote count
    *      Update Voter's struct by setting votedProposalId to the corresponding ID and hasVoted to true
    *      Compute the intermediate winningProposalID at each voter's vote in order to fix the DOS gas limit security breach
    *      Emit Voted event
    * @param _id Proposal ID
    */
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        if (proposalsArray[_id].voteCount > proposalsArray[winningProposalID].voteCount) {
            winningProposalID = _id;
        }

        emit Voted(msg.sender, _id);
    }


    // ::::::::::::: STATE ::::::::::::: //

    /**
    * @notice Start the voter's proposals registering session, usable only by the Owner
    *         Can only be called while in the RegisteringVoters workflowStatus
    * @dev Change status from RegisteringVoters to ProposalsRegistrationStarted
    *      Initialize the proposalsArray with the "GENESIS" proposal description as index 0
    *      Emit WorkflowStatusChange event with RegisteringVoters as previousStatus and ProposalsRegistrationStarted as newStatus
    */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
    * @notice End the voter's proposals registering session, usable only by the Owner
    *         Can only be called while in the ProposalsRegistrationStarted workflowStatus
    * @dev Change status from ProposalsRegistrationStarted to ProposalsRegistrationEnded
    *      Emit WorkflowStatusChange event with ProposalsRegistrationStarted as previousStatus and ProposalsRegistrationEnded as newStatus
    */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
    * @notice Start the voting session, usable only by the Owner
    *         Can only be called while in the ProposalsRegistrationEnded workflowStatus
    * @dev Change status from ProposalsRegistrationEnded to VotingSessionStarted
    *      Emit WorkflowStatusChange event with ProposalsRegistrationEnded as previousStatus and VotingSessionStarted as newStatus
    */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    
    /**
    * @notice End the voting session, usable only by the Owner
    *         Can only be called while in the VotingSessionStarted workflowStatus
    * @dev Change status from VotingSessionStarted to VotingSessionEnded
    *      Emit WorkflowStatusChange event with VotingSessionStarted as previousStatus and VotingSessionEnded as newStatus
    */
    /* THIS FUNCTION AS NO MORE PURPOSE AS "winningProposalID" IS SET IN THE setVote FUNCTION. THEN WE CAN CHANGE STATE FROM "VotingSessionStarted" TO "VotesTallied" DIRECTLY
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }
    */


    /* ORIGINAL tallyVotes FUNCTION
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
           if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
               _winningProposalId = p;
          }
        }
        winningProposalID = _winningProposalId;
       
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
    */

    /**
    * @notice End the voting session, usable only by the Owner
    *         Can only be called while in the VotingSessionStarted workflowStatus
    * @dev Change status from VotingSessionStarted to VotesTallied
    *      Emit WorkflowStatusChange event with VotingSessionStarted as previousStatus and VotesTallied as newStatus
    * @return winningProposalID that have been previously defined in the setVote function
    */
    function tallyVotes() external onlyOwner returns(uint){
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
       
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotesTallied);

        return winningProposalID;
    }

    receive() external payable {} // to support receiving ETH by default
    fallback() external payable {}
}


