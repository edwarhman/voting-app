const Voting = artifacts.require("Voting");
const utils = require("./helper/utils");
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
    voting = await Voting.new();
  });

  xcontext("registerVoter test cases", async ()=> {  
    it("should be able to register a new voter", async function () {
      let result = await voting.registerVoter({from: user1});
      console.log(result.logs);
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

    it("should not allow to post more candidates than allowed", async ()=> {
      let maxCandidates = await voting.maxCandidates();

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

  xcontext("voteForCandidate test cases", async ()=> {
    it("should increment specified candidate votes by one and set voter status to hasVoted", async ()=> {

    });

    it("should not allow to pass an invalid candidate ID", async ()=> {

    });

    it("should not allow a candidate to vote for himself", async ()=> {

    });

    it("should not allow to vote adressess that are not registered or are already vote", async ()=> {

    });
  });

});
