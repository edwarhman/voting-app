const Voting = artifacts.require("Voting");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Voting", function (accounts) {
  let voting;
  let [user1, user2, user3] = accounts; 
  let candidatesNames = ['Rodolfo', 'Peter', 'Sussan'];

  beforeEach(async ()=> {
    voting = await Voting.new();
  });

  context("registerVoter test cases", async ()=> {  
    it("should be able to register a new voter", async function () {
      let result = await voting.registerVoter({from: user1});
      console.log(result.logs);
      assert.equal(result.receipt.status, true);
    });

    it("should not allow a user register two times" , async ()=> {

    });
  })

  context("createCandidate test cases", async ()=> {  
    it("should be able to create a new candidate with the passed names and address", async ()=> {

    });

    it("should not allow to post more candidates than allowed", async ()=> {

    });

    it("should not allow to post a candidate two times", async ()=> {

    });
  });

  context("voteForCandidate test cases", async ()=> {
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
