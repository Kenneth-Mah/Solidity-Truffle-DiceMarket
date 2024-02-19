const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const BigNumber = require('bignumber.js');

var Dice = artifacts.require("../contracts/Dice.sol");
var DiceMarket = artifacts.require("../contracts/DiceMarket.sol");

contract('DiceMarket', function(accounts) {
    before(async () => {
        diceInstance = await Dice.deployed();
        diceMarketInstance = await DiceMarket.deployed();
    });
    console.log("Testing Trade Contract");

    it('Add Dice', async() => {
        let makeD1 = await diceInstance.add(1, 1, {from: accounts[1], value: 1000000000000000000});

        assert.notStrictEqual(
            makeD1,
            undefined,
            "Failed to make dice"
        );
    });

    it('Add Dice with no ether throws error', async() => {
        await truffleAssert.reverts(
            diceInstance.add(1, 1, {from: accounts[1]}),
            "at least 0.01 ETH is needed to spawn a new dice"
        );
    });

    it('Transfer Dice to DiceMarket', async() => {
        let t1 = await diceInstance.transfer(0, diceMarketInstance.address, {from: accounts[1]});
        let o1 = await diceInstance.getOwner(0);

        assert.strictEqual(
            o1,
            diceMarketInstance.address,
            "Failed to transfer dice"
        );
    });

    it('List Dice with price less than creation value + commission throws error', async() => {
        await truffleAssert.reverts(
            diceMarketInstance.list(0, 1),
            "list price less than creation value + commission fee"
        );
    });

    it('List Dice', async() => {
        let priceString = "2000000000000000000";
        let price = BigNumber(priceString);
        let l1 = await diceMarketInstance.list(0, price, {from: accounts[1]});
        let p1 = (await diceMarketInstance.checkPrice(0)).toString();

        assert(
            p1 === priceString,
            "Failed to list dice"
        );
    });

    it('Unlist Dice', async() => {
        let priceString = "0";
        let u1 = await diceMarketInstance.unlist(0, {from: accounts[1]});
        let p1 = (await diceMarketInstance.checkPrice(0)).toString();

        assert(
            p1 === priceString,
            "Failed to unlist dice"
        );
    });

    it('Buy Dice', async() => {
        let priceString = "2000000000000000000";
        let price = BigNumber(priceString);
        let l1 = await diceMarketInstance.list(0, price, {from: accounts[1]});
        let b2 = await diceMarketInstance.buy(0, {from: accounts[2], value: 2000000000000000000});
        let o2 = await diceInstance.getOwner(0);

        assert.strictEqual(
            o2,
            accounts[2],
            "Failed to buy dice"
        );
    })
});