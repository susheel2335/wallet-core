import { Coin, HD, Wallet } from '../../lib';
import assert from 'assert';

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

describe('Generate WalletData', () => {
    for (const coinUnit in coinAddresses) {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Wallet Data ${coinUnit}`, () => {
            let wdProvider;
            const wdGenerator = Wallet.Generator.createGenerator(coin, seed);

            it(`Test Can Generate WalletData provider`, async function () {
                this.timeout(30000);
                wdProvider = await wdGenerator.fill();

                wdProvider.destruct();
            });
        });
    }
});
