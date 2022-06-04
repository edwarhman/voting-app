// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

///@title A voting system
///@author Emerson Warhman
///@notice You can use this contract to manage a voting
///
contract Voting is Ownable {
    ///@dev voters can have 3 status: unregistered, registered, and has voted
    enum VOTER_STATUS {
        unregistered,
        registered,
        hasVoted
    }

    struct Candidate {
        string name;
        address addr;
        uint256 votes;
    }

    ///@notice returns the max number of candidates permited
    uint256 public maxCandidates;

    //colection of data

    ///@notice returns the specified by his ID
    Candidate[] public candidates;
    ///@dev check if address is a candidate
    mapping(address => bool) addressIsCandidate;
    ///@notice returns the specified voter status
    mapping(address => VOTER_STATUS) public voters;

    ///@dev variables required to restrict voting functions
    uint256 public countdown;
    uint256 public startTime;

    //events

    ///@notice when a candidate is posted emmit his name, address and id
    event CandidatePosted(
        string indexed name,
        address indexed addr,
        uint256 indexed id
    );
    ///@notice when a voter is registered or has vote for a candidate emmit the status change
    event VoterStatusChanged(address addr, VOTER_STATUS indexed status);

    ///@notice when a voter vote for a candidate emit the operation
    event NewVote(
        address voter,
        address indexed candidate,
        uint256 candidateVotes
    );

    ///@dev set the max candidates permited, the time when the voting starts and the countdown to voting closing
    constructor() {
        maxCandidates = 5;
        startTime = block.timestamp;
        countdown = 1 weeks;
    }

    ///@notice check if the voting is open to do operations
    modifier votingIsOpen() {
        require(
            block.timestamp < startTime + countdown,
            "The voting is close."
        );
        _;
    }

    ///@notice register a new voter in the voting
    function registerVoter() external votingIsOpen {
        require(
            voters[msg.sender] == VOTER_STATUS.unregistered,
            "The user address is already registered"
        );
        voters[msg.sender] = VOTER_STATUS.registered;
        emit VoterStatusChanged(msg.sender, voters[msg.sender]);
    }

    ///@notice post a new candidate to the voting using the specified name and address
    ///@param _name Candidate name
    ///@param _address Candidate address
    function postCandidate(string memory _name, address _address)
        external
        votingIsOpen
        onlyOwner
    {
        require(
            candidates.length < maxCandidates,
            "There are the maximum number of candidates."
        );
        require(
            addressIsCandidate[_address] == false,
            "The specified address already is a candidate."
        );
        candidates.push(Candidate(_name, _address, 0));
        addressIsCandidate[_address] = true;
        emit CandidatePosted(_name, _address, candidates.length - 1);
    }

    ///@notice sender voter votes for a candidate specified by his ID
    ///@param candidateId Candidate position in the record
    function voteForCandidate(uint256 candidateId) external votingIsOpen {
        require(
            candidateId < candidates.length,
            "The specified ID is invalid."
        );
        require(
            msg.sender != candidates[candidateId].addr,
            "A candidate is trying to vote for himself"
        );
        require(
            voters[msg.sender] == VOTER_STATUS.registered,
            "The user address is not registered in the voting or has already voted"
        );
        candidates[candidateId].votes++;
        voters[msg.sender] = VOTER_STATUS.hasVoted;
        emit NewVote(
            msg.sender,
            candidates[candidateId].addr,
            candidates[candidateId].votes
        );
        emit VoterStatusChanged(msg.sender, voters[msg.sender]);
    }
}
