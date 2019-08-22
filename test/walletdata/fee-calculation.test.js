import assert from 'assert';
import BigNumber from 'bignumber.js';
import {map} from 'lodash';
import {Coin, HD, Wallet, Networking, Constants} from '../../';
import {seed} from '../fixtures/seed';

const coinCases = {
    [Coin.Unit.BTC]: {
        defaultFeeRate: '0.00000008'
    },
    [Coin.Unit.BTCt]: {
        defaultFeeRate: '0.00000008'
    },
    [Coin.Unit.LTC]: {
        defaultFeeRate: '0.00000200'
    },
    [Coin.Unit.LTCt]: {
        defaultFeeRate: '0.00000200'
    },
    [Coin.Unit.DASH]: {
        defaultFeeRate: '0.00000008'
    },
    [Coin.Unit.DASHt]: {
        defaultFeeRate: '0.00000008'
    },
    [Coin.Unit.ETH]: {
        defaultGasPrice: '0.000000000000000008000000'
    },
    [Coin.Unit.ETHt]: {
        defaultGasPrice: '0.000000000000000008000000'
    },
};

describe('Fee Calculation', () => {
    for (const coinUnit in coinCases) {
        describe(`Fee of ${coinUnit}`, () => {

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


            it(`Can get Default Fee options`, () => {
                const mediumFee = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);
                assert.strictEqual(typeof mediumFee, 'object');
                assert.strictEqual(mediumFee.feeType, 'medium');

                if (coin.isBIPType()) {
                    assert.ok(BigNumber.isBigNumber(mediumFee.feeRate), 'feeRate is not BigNumber');
                    assert.strictEqual(mediumFee.feeRate.toFixed(8), cases.defaultFeeRate);
                } else {
                    assert.ok(BigNumber.isBigNumber(mediumFee.gasPrice), 'gasPrice is not BigNumber');
                    assert.strictEqual(mediumFee.gasPrice.toFixed(24), cases.defaultGasPrice);

                    assert.ok(BigNumber.isBigNumber(mediumFee.gasLimit), 'gasLimit is not BigNumber');
                }
            });


            it(`Can get network Fee options`, async () => {
                const feeRecord = await wdProvider.fee.fetchFeeRecord();
                const mediumFee = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium, feeRecord);

                assert.strictEqual(typeof mediumFee, 'object');
                assert.strictEqual(mediumFee.feeType, 'medium');

                if (coin.isBIPType()) {
                    assert.ok(BigNumber.isBigNumber(mediumFee.feeRate), 'feeRate is not BigNumber');

                } else {
                    assert.ok(BigNumber.isBigNumber(mediumFee.gasPrice), 'gasPrice is not BigNumber');
                    assert.ok(BigNumber.isBigNumber(mediumFee.gasLimit), 'gasLimit is not BigNumber');
                }
            });
        });
    }
});
