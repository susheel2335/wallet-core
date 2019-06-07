import assert from 'assert';
import { Coin, HD } from '../../';

import { seed } from '../fixtures/seed';

const coinAddresses = {
    [Coin.Unit.BTC]: {},
    [Coin.Unit.BTCt]: {},
    [Coin.Unit.LTC]: {},
    [Coin.Unit.LTCt]: {},
    [Coin.Unit.DASH]: {},
    [Coin.Unit.DASHt]: {},
    [Coin.Unit.ETH]: {},
    [Coin.Unit.ETHt]: {}
};

describe('Derive address', () => {
    for (const coinUnit in coinAddresses) {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Derive addresses for ${coinUnit}`, () => {
            it(`Can derive RECEIVE address`, () => {
                coin.makePrivateFromSeed(seed).deriveAddress(HD.BIP44.AddressType.RECEIVE, 0);
                assert.strictEqual(true, true);
            });

            it(`Can derive CHANGE address`, () => {
                coin.makePrivateFromSeed(seed).deriveAddress(HD.BIP44.AddressType.CHANGE, 0);
                assert.strictEqual(true, true);
            });
        });
    }
});
