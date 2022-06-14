const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const Voting = artifacts.require('Voting')
const utils = require('./helpers/utils')
const time = require('./helpers/time')
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('Voting', function (accounts) {
    let voting
    let [owner, user1, user2, candidate1, candidate2] = accounts
    let candidatesNames = ['Rodolfo', 'Peter', 'Sussan', 'Abby', 'Julien']

    beforeEach(async () => {
        voting = await deployProxy(Voting)
    })

    context('createNewVoting test cases', async () => {
        it('should be able to create a new voting', async function () {
            let title = 'Presidential elections'
            let description = 'Presidential elections from Venezuela 2024-2030'
            let countdown = 259200
            let maxCandidates = 5
            let tx = await voting.createNewVoting(
                title,
                description,
                maxCandidates,
                countdown
            )
            let votingInfo = await voting.votingHistory(0)
            assert.equal(votingInfo.title, title)
            assert.equal(votingInfo.description, description)
            assert.equal(votingInfo.currentCandidates, 0)
            assert.equal(votingInfo.maxCandidates, maxCandidates)
        })
    })

    context('registerVoter test cases', async () => {
        beforeEach(async () => {
            await voting.createNewVoting(
                'Presidential',
                '2023-2029',
                5,
                259200
            )
        })
        it('should be able to register a new voter', async function () {
            let result = await voting.registerVoter(0, { from: user1 })
            assert.equal(result.receipt.status, true)
        })

        it('should not allow a user register two times', async () => {
            await voting.registerVoter(0, { from: user2 })
            await utils.shouldThrow(voting.registerVoter(0, { from: user2 }))
        })
    })

    context('createCandidate test cases', async () => {
        beforeEach(async () => {
            await voting.createNewVoting(
                'Presidential',
                '2023-2029',
                5,
                259200
            )
        })
        it('should be able to create a new candidate with the passed names and address', async () => {
            let result = await voting.postCandidate(
                0,
                candidatesNames[0],
                candidate1,
                { from: owner }
            )
            let candidateInfo = await voting.candidatesInfo(0, 0)
            assert.equal(result.receipt.status, true)
            assert.equal(candidateInfo.addr, candidate1)
        })

        it('should not allow an address that is not the owner to post a candidate', async () => {
            await utils.shouldThrow(
                voting.postCandidate(candidatesNames[0], candidate1, {
                    from: user1,
                })
            )
        })

        it('should not allow to post more candidates than allowed', async () => {
            let maxCandidates = 5

            for (var i = 0; i < maxCandidates; i++) {
                await voting.postCandidate(0, candidatesNames[i], accounts[i], {
                    from: owner,
                })
            }
            await utils.shouldThrow(
                voting.postCandidate(0, 'Carl', accounts[6], { from: owner })
            )
        })

        it('should not allow to post a candidate two times', async () => {
            await voting.postCandidate(0, candidatesNames[0], candidate1, {
                from: owner,
            })
            await utils.shouldThrow(
                voting.postCandidate(candidatesNames[0], candidate1, {
                    from: owner,
                })
            )
        })
    })

    context('voteForCandidate test cases', async () => {
        beforeEach(async () => {
            await voting.createNewVoting(
                'Presidential',
                '2023-2029',
                5,
                259200
            )
            await voting.postCandidate(0, candidatesNames[0], candidate1, {
                from: owner,
            })
        })

        it('should increment specified candidate votes by one and set voter status to hasVoted', async () => {
            let candidateInfo
            let result
            let voterState

            await voting.registerVoter(0, { from: user1 })
            result = await voting.voteForCandidate(0, 0, { from: user1 })
            candidateInfo = await voting.candidatesInfo(0, 0)
            voterState = await voting.voters(user1, 0)

            assert.equal(result.receipt.status, true)
            assert.equal(candidateInfo.votes, 1)
            assert.equal(voterState, 2) // 2 represents enum VOTER_STATUS.hasVoted
        })

        it('should not allow to pass an invalid candidate ID', async () => {
            await voting.registerVoter(0, { from: user1 })
            await utils.shouldThrow(
                voting.voteForCandidate(0, 1, { from: user1 })
            )
        })

        it('should not allow a candidate to vote for himself', async () => {
            await voting.registerVoter(0, { from: candidate1 })
            await utils.shouldThrow(
                voting.voteForCandidate(0, 0, { from: candidate1 })
            )
        })

        it('should not allow to vote adressess that are not registered or are already vote', async () => {
            await voting.registerVoter(0, { from: user1 })
            await voting.voteForCandidate(0, 0, { from: user1 })
            await utils.shouldThrow(
                voting.voteForCandidate(0, 0, { from: user1 })
            )
            await utils.shouldThrow(
                voting.voteForCandidate(0, 0, { from: user2 })
            )
        })
    })

    context('other considerations', async () => {
        beforeEach(async () => {
            await voting.createNewVoting(
                'Presidential',
                '2023-2029',
                5,
                259200
            )
            await voting.postCandidate(0, candidatesNames[0], candidate1, {
                from: owner,
            })
        })

        it('should not allow to register new voters, post candidates or vote for a candidate after the voting is closed', async () => {
            await time.advanceTimeAndBlock(time.duration.weeks(1))
            await utils.shouldThrow(voting.registerVoter(0, { from: user1 }))
            await utils.shouldThrow(
                voting.postCandidate(0, candidatesNames[1], candidate2, {
                    from: owner,
                })
            )
            await utils.shouldThrow(
                voting.voteForCandidate(0, 0, { from: user1 })
            )
        })

        it('should allow to do multiple votings simultaneously', async () => {
            await voting.createNewVoting(
                'Regional',
                'voting for states',
                5,
                time.duration.weeks(1)
            )
            await voting.postCandidate(1, candidatesNames[0], candidate1, {
                from: owner,
            })
            await voting.registerVoter(0, { from: user1 })
            await voting.registerVoter(1, { from: user1 })
            let tx = await voting.voteForCandidate(0, 0, { from: user1 })
            assert.equal(tx.receipt.status, true)
            tx = await voting.voteForCandidate(1, 0, { from: user1 })
            assert.equal(tx.receipt.status, true)
        })
    })
})
