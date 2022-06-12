/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-truffle5");
require("solidity-coverage");
// hardhat.config.js
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: "0.8.12",
};
