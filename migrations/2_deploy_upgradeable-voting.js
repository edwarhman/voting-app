const {deployProxy} = require('@openzeppelin/truffle-upgrades');

const Voting = artifacts.require("Voting");

module.exports = async function (deployer) {
    const instance = await deployProxy(Voting, [], {deployer});
    console.log("Deployed", instance.address);
};
