import * as Plark from '../';
import assert from 'assert';
import _ from 'lodash';

const Coin = Plark.Coin;
// const Utils = Plark.Utils;

const coinsToTest = {
    [Coin.Unit.BTC]: {
        isSegwit: true,
    },
    [Coin.Unit.LTC]: {
        isSegwit: true,
    },
    [Coin.Unit.DASH]: {
        isSegwit: false
    },

    [Coin.Unit.BTCt]: {
        isSegwit: true
    },
    [Coin.Unit.LTCt]: {
        isSegwit: true
    },
    [Coin.Unit.DASHt]: {
        isSegwit: false
    }
};

describe('Segwit coin', () => {
    _.each(coinsToTest, (testParams, coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        const testCoin = () => {
            if (!coin.isBIPType()) {
                return;
            }

            it(`SeGwit ${testParams.isSegwit ? 'enabled' : 'disabled'}`, () => {
                assert.strictEqual(coin.isSegWitAvailable(), testParams.isSegwit);
            });

            if (!testParams.isSegwit) {
                return;
            }
        };

        describe(`SegWit coin - ${coinUnit}`, testCoin);
    });
});
