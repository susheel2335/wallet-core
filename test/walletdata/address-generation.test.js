import assert from 'assert';
import BigNumber from 'bignumber.js';
import { Coin, HD, Wallet, Networking } from '../../lib';
import { seed } from '../fixtures/seed';

const coinCases = {
    [Coin.Unit.BTC]: {},
    [Coin.Unit.BTCt]: {
        generateTransaction: true,
    },
    [Coin.Unit.LTC]: {},
    [Coin.Unit.LTCt]: {},
    [Coin.Unit.DASH]: {},
    [Coin.Unit.DASHt]: {},
    [Coin.Unit.ETH]: {},
    [Coin.Unit.ETHt]: {}
};

describe('Generate WalletData', () => {
    for (const coinUnit in coinCases) {
        const cases = coinCases[coinUnit];
        const coin = Coin.makeCoin(coinUnit);

        describe(`Wallet Data ${coinUnit}`, () => {

            const networkProvider = Networking.createNetworkProvider(coin);

            let wdProvider;
            const wdGenerator = Wallet.Generator.createGenerator(coin, seed, networkProvider);
            const promiseLists = [];

            const waitGenerateWDProvider = new Promise((resolve, reject) => {
                wdGenerator.fill().then(wdp => resolve(wdp), reject);
            });

            it(`Test Can Generate WalletData provider`, async function () {
                this.timeout(30000);
                wdProvider = await waitGenerateWDProvider;
            });


            it(`Can get balance`, () => {
                const balance = Wallet.calculateBalance(wdProvider.balance);
                assert.strictEqual(typeof balance, 'number');
            });

            if ('generateTransaction' in cases) {
                it(`Can generate Transaction`, async function () {
                    const waitGenerateTx = new Promise(async (resolve, reject) => {
                        try {
                            const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                            const tx = await wdProvider.getPrivate(seed).createTransaction(
                                coin.getKeyFormat().parseAddress(address.address),
                                new BigNumber(0.0001),
                                Coin.FeeTypes.Medium
                            );

                            resolve(tx.id);
                        } catch (error) {
                            reject(error);
                        }
                    });

                    promiseLists.push(waitGenerateTx);

                    await waitGenerateTx;
                });
            }


            Promise.all(promiseLists).finally(() => {
                if (wdProvider) {
                    console.log('Call destruct');
                    wdProvider.destruct();
                    networkProvider.destruct();
                }
            });
        });
    }
});
