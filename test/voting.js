const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const Voting = artifacts.require("Voting");
const utils = require("./helpers/utils");
const time = require("./helpers/time");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Voting", function (accounts) {
  let voting;
  let [owner, user1, user2, user3, candidate1, candidate2] = accounts; 
  let candidatesNames = ['Rodolfo', 'Peter', 'Sussan', "Abby", "Julien"];

  beforeEach(async ()=> {
    voting = await deployProxy(Voting);
  });

  context("registerVoter test cases", async ()=> {  
    it("should be able to register a new voter", async function () {
      let result = await voting.registerVoter({from: user1});
      assert.equal(result.receipt.status, true);
    });

    it("should not allow a user register two times" , async ()=> {
      await voting.registerVoter({from: user2}); 
      await utils.shouldThrow(voting.registerVoter({from: user2}));
    });
  })

  context("createCandidate test cases", async ()=> {  
    it("should be able to create a new candidate with the passed names and address", async ()=> {
      let result = await voting.postCandidate(candidatesNames[0], candidate1, {from: owner});
      let candidateInfo = await voting.candidates(0);
      assert.equal(result.receipt.status, true);
      assert.equal(candidateInfo.addr, candidate1);
    });

    it("should not allow an address that is not the owner to post a candidate", async ()=> {
      await utils.shouldThrow(voting.postCandidate(candidatesNames[0], candidate1, {from: user1}));
    })

    it("should not allow to post more candidates than allowed", async ()=> {
      let maxCandidates = await voting.maxCandidates()

      for (var i = 0; i < maxCandidates; i++) {
        await voting.postCandidate(candidatesNames[i], accounts[i], {from: owner});
      }
      await utils.shouldThrow(voting.postCandidate("Carl", accounts[6], {from: owner}));
    });

    it("should not allow to post a candidate two times", async ()=> {
      await voting.postCandidate(candidatesNames[0], candidate1, {from: owner});
      await utils.shouldThrow(voting.postCandidate(candidatesNames[0], candidate1, {from: owner}));
    });
  });

  context("voteForCandidate test cases", async ()=> {
  
    it("should increment specified candidate votes by one and set voter status to hasVoted", async ()=> {
      let candidateInfo;
      let result;
      let voterState;

      await voting.postCandidate(candidatesNames[0], candidate1, {from: owner});
      await voting.registerVoter({from: user1});
      result = await voting.voteForCandidate(0, {from: user1});
      candidateInfo = await voting.candidates(0);
      voterState = await voting.voters(user1);

      assert.equal(result.receipt.status, true);
      assert.equal(candidateInfo.votes, 1);
      assert.equal(voterState, 2); // 2 represents enum VOTER_STATUS.hasVoted

    });

    it("should not allow to pass an invalid candidate ID", async ()=> {
      await voting.registerVoter({from: user1});
      await utils.shouldThrow(voting.voteForCandidate(0, {from: user1}));
    });

    it("should not allow a candidate to vote for himself", async ()=> {
      await voting.postCandidate(candidatesNames[0], candidate1, {from: owner});
      await voting.registerVoter({from: candidate1});
      await utils.shouldThrow(voting.voteForCandidate(0, {from: candidate1}));
    });

    it("should not allow to vote adressess that are not registered or are already vote", async ()=> {
      await voting.postCandidate(candidatesNames[0], candidate1, {from: owner});
      await voting.postCandidate(candidatesNames[1], candidate2, {from: owner});
      await voting.registerVoter({from: user1});
      await voting.voteForCandidate(0, {from: user1});
      await utils.shouldThrow(voting.voteForCandidate(1, {from: user1}));
      await utils.shouldThrow(voting.voteForCandidate(0, {from: user2}));
    });
  });

  context("functions calling after the voting is closed", async ()=> {
    it("should not allow to register new voters, post candidates or vote for a candidate after the voting is closed", async ()=> {
      await time.advanceTimeAndBlock(time.duration.weeks(1));
      await utils.shouldThrow(voting.registerVoter({from: user1}));
      await utils.shouldThrow(voting.postCandidate(candidatesNames[0], candidate1, {from: owner}));
      await utils.shouldThrow(voting.voteForCandidate(0, {from: user1}));
    })
  });

});
