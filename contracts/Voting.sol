// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Voting {
  enum VOTER_STATUS {
    unregistered, registered, hasVoted
  }

  struct Candidate {
    string name; 
    address addr;
    uint votes;
  }

  uint public maxCandidates;

  //colection of data
  Candidate[] public candidates;
  mapping(address => bool) addressIsCandidate;
  mapping(address => VOTER_STATUS) public voters;

  //Timer variables
  uint public countdown;
  uint public startTime;

  //events
  event CandidatePosted (
    string name,
    address addr
  );

  event VoterStatusChanged (
    address addr,
    VOTER_STATUS status
  ); 

  event NewVote (
    address voter,
    address candidate,
    uint candidateVotes
  );

  constructor() {
    maxCandidates = 5;
    startTime = block.timestamp;
    countdown = 1 weeks;
  }

  modifier votingIsOpen() {
    require(block.timestamp < startTime + countdown, "The voting is close.");
    _;
  }

  function registerVoter() external votingIsOpen {
    require(voters[msg.sender] == VOTER_STATUS.unregistered, "The user address is already registered");
    voters[msg.sender] = VOTER_STATUS.registered;
    emit VoterStatusChanged(msg.sender, voters[msg.sender]);
  }

  function postCandidate(string memory _name, address _address) external votingIsOpen {
    require(candidates.length < maxCandidates, "There are the maximum number of candidates.");
    require(addressIsCandidate[_address] == false, "The specified address already is a candidate.");
    candidates.push(Candidate(_name, _address, 0));
    addressIsCandidate[_address] = true;
    emit CandidatePosted(_name, _address);
  }

  function voteForCandidate(uint candidateId) external votingIsOpen {
    require(candidateId < candidates.length, "The specified ID is invalid.");
    require(msg.sender != candidates[candidateId].addr, "A candidate is trying to vote for himself");
    require(voters[msg.sender] == VOTER_STATUS.registered, "The user address is not registered in the voting or has already voted");
    candidates[candidateId].votes++;
    voters[msg.sender] = VOTER_STATUS.hasVoted;
    emit NewVote(msg.sender, candidates[candidateId].addr, candidates[candidateId].votes);
    emit VoterStatusChanged(msg.sender, voters[msg.sender]);
  }
}
