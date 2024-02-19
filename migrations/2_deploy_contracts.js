const Dice = artifacts.require("Dice");
const DiceMarket = artifacts.require("DiceMarket");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(Dice).then(function() {
        return deployer.deploy(DiceMarket, Dice.address, "1000000000000000000")
    });
};