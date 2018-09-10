import * as Berrywallet from '../lib';
import assert from 'assert';
import _ from 'lodash';

const Coin = Berrywallet.Coin;
// const Utils = Berrywallet.Utils;

const coinsToTest = {
    [Coin.Unit.BTC]: {
        isMultiaddress: true,
        parseAddress: [
            '1Cud6K5gsnJ3Trc2Y2gbikbqBGmqPKTyb6'
        ]
    },
    [Coin.Unit.ETH]: {
        isMultiaddress: false,
        parseAddress: [
            '0xfe36eef5f8f1b2d097d51ffd1c78804f48886d93'
        ]
    },
    [Coin.Unit.LTC]: {
        isMultiaddress: true
    },
    [Coin.Unit.DASH]: {
        isMultiaddress: true,
        parseAddress: [
            'XhkqBcJaeqezeHkbcx1PRktseaG4fKnGso'
        ]
    },

    [Coin.Unit.BTCt]: {
        isMultiaddress: true,
        parseAddress: [
            '2MxNGc4k98cUDigJADnfYF7sLZS4rGnRYS1',
            'mh6Wdx99ZgxFqzVReKHCc4pZQRvTK75xJ6'
        ]
    },
    [Coin.Unit.ETHt]: {
        isMultiaddress: false,
        parseAddress: [
            '0xfe36eef5f8f1b2d097d51ffd1c78804f48886d93'
        ]
    },
    [Coin.Unit.LTCt]: {
        isMultiaddress: true
    },
    [Coin.Unit.DASHt]: {
        isMultiaddress: true
    }
};

describe('Test Common coin', () => {
    _.each(coinsToTest, (testParams, coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        const testCoin = () => {
            it('Success build', () => {
                assert.strictEqual(coinUnit, coin.getUnit(), `${coinUnit} not accepted ${coin.getUnit()}`);
            });

            it('Test MultiAddress', () => {
                assert.strictEqual(testParams.isMultiaddress, coin.isMultiAddressAccount());
            });

            if (testParams.parseAddress) {
                it(`Test Parse ${coinUnit} address`, () => {
                    testParams.parseAddress.map(addr => {

                        const testFunction = () => {
                            coin.getKeyFormat().parseAddress(addr)
                        };

                        assert.doesNotThrow(testFunction, `Can not parse address ${addr}`);
                    });
                });
            }
        };

        describe(`Test public coin - ${coinUnit}`, testCoin);
    });
});

