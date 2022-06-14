// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**@title A voting system
 **@author Emerson Warhman
 **@notice You can use this contract to manage a voting
 */
contract Voting is OwnableUpgradeable {
    //types declarations

    //voters can have 3 status: unregistered, registered, and has voted
    enum VoterStatus {
        unregistered,
        registered,
        hasVoted
    }

    struct VotingData {
        string title;
        string description;
        uint256 currentCandidates;
        uint256 maxCandidates;
        uint256 countdown;
        uint256 totalVotes;
    }

    struct Candidate {
        string name;
        address addr;
        uint256 votes;
    }

    //state variables

    ///@notice Collection of all the voting
    VotingData[] public votingHistory;
    ///@notice returns the specified candidate by their ID in the voting
    ///@notice must specify the voting ID first and then the candidate ID
    mapping(uint256 => mapping(uint256 => Candidate)) public candidatesInfo;
    ///@notice returns the specified voter status
    ///@notice must specify the voter address first and then the voting id to check
    mapping(address => mapping(uint256 => VoterStatus)) public voters;

    //events

    ///@notice when a voting is created emit its information
    event VotingCreated(
        string title,
        string description,
        uint256 indexed countdown,
        uint256 indexed id
    );
    ///@notice when a candidate is posted emit his information
    event CandidatePosted(
        uint256 indexed voting,
        string name,
        address indexed addr,
        uint256 id
    );
    ///@notice when a voter is registered or has voted successfuly emit the status change
    event VoterStatusChanged(
        address indexed addr,
        uint256 indexed voting,
        VoterStatus indexed status
    );
    ///@notice when a voter vote for a candidate emit the operation
    event NewVote(
        uint256 indexed voting,
        address indexed voter,
        address indexed candidate,
        uint256 candidateVotes
    );

    ///@dev set the contract owner
    function initialize() public initializer {
        __Ownable_init();
    }

    ///@notice check if the voting is open to do operations
    ///@param votingId Id of the voting
    modifier votingIsOpen(uint256 votingId) {
        require(
            block.timestamp < votingHistory[votingId].countdown,
            "The voting is close."
        );
        _;
    }

    ///@notice create a new voting
    ///@param title Title for the voting
    ///@param description Short description for the voting
    ///@param maxCandidates Max amount of candidates that can participate in the voting
    ///@param countdown Countdown to the end of the voting (in seconds)
    function createNewVoting(
        string memory title,
        string memory description,
        uint256 maxCandidates,
        uint256 countdown
    ) external {
        votingHistory.push(
            VotingData(
                title,
                description,
                0,
                maxCandidates,
                block.timestamp + countdown,
                0
            )
        );
        emit VotingCreated(
            title,
            description,
            countdown,
            votingHistory.length - 1
        );
    }

    ///@notice register a new voter in the specified voting
    ///@param votingId ID of the voting
    function registerVoter(uint256 votingId) external votingIsOpen(votingId) {
        require(
            voters[msg.sender][votingId] == VoterStatus.unregistered,
            "The user address is already registered"
        );
        voters[msg.sender][votingId] = VoterStatus.registered;
        emit VoterStatusChanged(
            msg.sender,
            votingId,
            voters[msg.sender][votingId]
        );
    }

    ///@notice post a new candidate to the voting using the specified name and address
    ///@param votingId ID of the voting
    ///@param _name Candidate name
    ///@param _address Candidate address
    function postCandidate(
        uint256 votingId,
        string memory _name,
        address _address
    ) public votingIsOpen(votingId) onlyOwner {
        uint256 candidateId = votingHistory[votingId].currentCandidates++;
        require(
            votingHistory[votingId].currentCandidates <=
                votingHistory[votingId].maxCandidates,
            "There are the maximum number of candidates."
        );
        require(
            candidatesInfo[votingId][candidateId].addr == address(0),
            "The specified address already is a candidate."
        );
        candidatesInfo[votingId][candidateId] = Candidate(_name, _address, 0);
        emit CandidatePosted(votingId, _name, _address, candidateId);
    }

    ///@notice sender voter votes for a candidate specified by his ID
    ///@param votingId ID of the voting
    ///@param candidateId Candidate position in the record
    function voteForCandidate(uint256 votingId, uint256 candidateId)
        external
        votingIsOpen(votingId)
    {
        require(
            candidateId < votingHistory[votingId].currentCandidates,
            "The specified ID is invalid."
        );
        require(
            msg.sender != candidatesInfo[votingId][candidateId].addr,
            "Candidates cannot vote for themselves"
        );
        require(
            voters[msg.sender][votingId] == VoterStatus.registered,
            "The user address is not registered in the voting or has already voted"
        );
        candidatesInfo[votingId][candidateId].votes++;
        voters[msg.sender][votingId] = VoterStatus.hasVoted;
        emit NewVote(
            votingId,
            msg.sender,
            candidatesInfo[votingId][candidateId].addr,
            candidatesInfo[votingId][candidateId].votes
        );
        emit VoterStatusChanged(
            msg.sender,
            votingId,
            voters[msg.sender][votingId]
        );
    }
}
