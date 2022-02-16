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

  //colection of data
  address[] candidates;
  mapping(address => bool) addressIsCandidate;
  mapping(address => VOTER_STATUS) voters;

  uint countdown;
  uint startTime;

  constructor() public {
    startTime = now;
    countdown = 1 week;
  }

  modifier votingIsOpen() {
    require(now < startTime + countdown);
    _;
  }

  function registerVoter() external votingIsOpen {
    require(voters[msg.sender] == VOTER_STATUS.unregistered);
    voters[msg.sender] = VOTER_STATUS.registered;
  }

  function postCandidate(string memory _name, address _address) external votingIsOpen {
    require(candidates.length < maxCandidates);
    require(addressIsCandidate[_address] == false);
    candidates.push(Candidate(_name, _address, 0));
    addressIsCandidate[_address] = true;
  }

  function voteForCandidate(uint candidateId) external votingIsOpen {
    require(candidateId < candidates.length);
    require(msg.sender != candidates[candidateId].addr);
    require(voters[msg.sender] == VOTER_STATUS.registered);
    candidates[candidateId].votes++;
    voters[msg.sender] == VOTER_STATUS.hasVoted;
  }
}
