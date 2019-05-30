import assert from 'assert';
import BigNumber from 'bignumber.js';
import { Coin, HD, Wallet, Networking } from '../../lib';
import { seed } from '../fixtures/seed';

const coinCases = {
    [Coin.Unit.BTC]: {},
    [Coin.Unit.BTCt]: {
        generateTransaction: true,
        calculateFee: true,
    },
    [Coin.Unit.LTC]: {},
    [Coin.Unit.LTCt]: {
        calculateFee: true,
    },
    [Coin.Unit.DASH]: {},
    [Coin.Unit.DASHt]: {
        calculateFee: true,
    },
    [Coin.Unit.ETH]: {
        calculateFee: true,
    },
    [Coin.Unit.ETHt]: {
        calculateFee: true,
    }
};

describe('Generate WalletData', () => {
    for (const coinUnit in coinCases) {
        describe(`Wallet Data ${coinUnit}`, () => {

            const cases = coinCases[coinUnit];
            const coin = Coin.makeCoin(coinUnit);

            let networkProvider;
            let wdProvider;

            before(async function () {
                this.timeout(15000);

                networkProvider = Networking.createNetworkProvider(coin);

                const wdGenerator = Wallet.Generator.createGenerator(coin, seed, networkProvider);
                wdProvider = await wdGenerator.fill();
            });

            after(function () {
                if (wdProvider) {
                    wdProvider.destruct();
                }

                if (networkProvider) {
                    networkProvider.destruct();
                }
            });

            it(`Can get balance`, () => {
                const balance = Wallet.calculateBalance(wdProvider.balance);
                assert.strictEqual(typeof balance, 'number');
            });


            if ('calculateFee' in cases) {
                it(`Can calculate fee`, async () => {
                    const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                    const feeResponse = await wdProvider.getPrivate(seed).calculateFee(
                        new BigNumber(0.01),
                        coin.getKeyFormat().parseAddress(address.address),
                        Coin.FeeTypes.Medium
                    );

                    console.log(`Fee of ${feeResponse.coin}: ` + feeResponse.fee.toNumber());
                    assert.strictEqual(typeof feeResponse, 'object');
                });
            }

            if ('generateTransaction' in cases) {
                it(`Can generate Transaction`, async () => {
                    const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                    const tx = await wdProvider.getPrivate(seed).createTransaction(
                        coin.getKeyFormat().parseAddress(address.address),
                        new BigNumber(0.0001),
                        Coin.FeeTypes.Medium
                    );

                    assert.strictEqual(typeof tx, 'object');
                    assert.ok(tx.id);
                });
            }
        });
    }
});
