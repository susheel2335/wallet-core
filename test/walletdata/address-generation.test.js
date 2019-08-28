import assert from 'assert';
import BigNumber from 'bignumber.js';
import {map} from 'lodash';
import {Coin, HD, Wallet, Networking, Constants} from '../../';
import {seed} from '../fixtures/seed';

const coinCases = {
    [Coin.Unit.BTC]: {},
    [Coin.Unit.BTCt]: {
        generateTransaction: true,
        calculateFee: true,
        calculateMax: true,
    },
    [Coin.Unit.LTC]: {},
    [Coin.Unit.LTCt]: {
        calculateFee: true,
        calculateMax: true,
    },
    [Coin.Unit.DASH]: {},
    [Coin.Unit.DASHt]: {
        calculateFee: true,
        calculateMax: true,
    },
    [Coin.Unit.ETH]: {
        calculateFee: true,
        calculateMax: true,
    },
    [Coin.Unit.ETHt]: {
        calculateFee: true,
        calculateMax: true,
    }
};

describe('Generate WalletData', () => {
    for (const coinUnit in coinCases) {
        describe(`Wallet Data ${coinUnit}`, () => {

            const cases = coinCases[coinUnit];
            const coin = Coin.makeCoin(coinUnit);

            let networkProvider;
            let wdProvider;
            let balanceAmount;

            before(async function () {
                this.timeout(15000);

                networkProvider = Networking.createNetworkProvider(coin);

                const wdGenerator = Wallet.Generator.createGenerator(coin, seed, networkProvider);
                wdProvider = await wdGenerator.fill();

                try {
                    balanceAmount = Wallet.calculateBalance(wdProvider.balance);
                } catch (error) {
                }
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


            if (cases.calculateFee) {
                it(`Can calculate fee`, () => {
                    const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                    let toAddress = coin.getKeyFormat().parseAddress(address.address);

                    const feeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);

                    const feeResponse = wdProvider.fee.calculateFee(
                        new BigNumber(0.01),
                        feeOptions,
                        toAddress.toString(),
                    );

                    assert.strictEqual(typeof feeResponse, 'object');
                });
            }


            if (cases.calculateMaxAmount) {
                it(`Can calculate max amount`, () => {
                    if (!balanceAmount || balanceAmount < 0.001) {
                        return;
                    }

                    const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                    let toAddress = coin.getKeyFormat().parseAddress(address.address);

                    const feeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);

                    const maxAmountResponse = wdProvider.fee.calculateMax(
                        feeOptions,
                        toAddress.toString(),
                    );

                    assert.strictEqual(typeof maxAmountResponse, 'object');
                    assert.strictEqual(
                        maxAmountResponse.amount.plus(maxAmountResponse.fee).toString(),
                        maxAmountResponse.balance
                    );
                });
            }

            if (cases.generateTransaction) {
                it(`Can generate Transaction`, () => {
                    const address = wdProvider.address.last(HD.BIP44.AddressType.CHANGE);
                    let toAddress = coin.getKeyFormat().parseAddress(address.address);

                    const feeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);

                    const tx = wdProvider.getPrivate(seed).syncCreateTransaction(
                        toAddress,
                        new BigNumber(0.0001),
                        feeOptions
                    );

                    assert.strictEqual(typeof tx, 'object');
                    assert.ok(tx.id);
                });
            }
        });
    }
});
