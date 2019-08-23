import assert from 'assert';
import BigNumber from 'bignumber.js';
import {map} from 'lodash';
import {Coin, HD, Wallet, Networking, Constants, Exceptions} from '../../';
import {seed} from '../fixtures/seed';

const coinCases = {
    [Coin.Unit.BTC]: {
        defaultFeeRate: '0.00000008',
        defaultMaxAmount: false,
    },
    [Coin.Unit.BTCt]: {
        defaultFeeRate: '0.00000008',
        defaultMaxAmount: '1.58079389',
    },
    [Coin.Unit.LTC]: {
        defaultFeeRate: '0.00000200',
        defaultMaxAmount: false,
    },
    [Coin.Unit.LTCt]: {
        defaultFeeRate: '0.00000200',
        defaultMaxAmount: false,
    },
    [Coin.Unit.DASH]: {
        defaultFeeRate: '0.00000008',
        defaultMaxAmount: false,
    },
    [Coin.Unit.DASHt]: {
        defaultFeeRate: '0.00000008',
        defaultMaxAmount: false,
    },
    [Coin.Unit.ETH]: {
        defaultGasPrice: '8.0',
        defaultMaxAmount: false,
    },
    [Coin.Unit.ETHt]: {
        defaultGasPrice: '8.0',
        defaultMaxAmount: false
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
                    assert.strictEqual(mediumFee.gasPrice.toFixed(1), cases.defaultGasPrice);

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


            it(`Can calculate Default Fee`, async () => {
                const mediumFeeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);
                const txFeeResponse = wdProvider.fee.calculateFee(new BigNumber(0.001), mediumFeeOptions);

                assert.strictEqual(typeof txFeeResponse, 'object');
                assert.ok(BigNumber.isBigNumber(txFeeResponse.fee), 'fee is not BigNumber');
                assert.strictEqual(txFeeResponse.coin, coin.getUnit());
            });


            it(`Can calculate actual Fee`, async () => {
                const feeRecord = await wdProvider.fee.fetchFeeRecord();
                const mediumFeeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium, feeRecord);
                const txFeeResponse = wdProvider.fee.calculateFee(new BigNumber(0.001), mediumFeeOptions);

                assert.strictEqual(typeof txFeeResponse, 'object');
                assert.ok(BigNumber.isBigNumber(txFeeResponse.fee), 'fee is not BigNumber');
                assert.strictEqual(txFeeResponse.coin, coin.getUnit());
            });


            it(`Can calculate Default Max fee`, async () => {
                const mediumFeeOptions = wdProvider.fee.getFeeOptions(Constants.FeeTypes.Medium);

                try {
                    const maxAmountResponse = wdProvider.fee.calculateMaxAmount(mediumFeeOptions);

                    assert.strictEqual(typeof maxAmountResponse, 'object');
                    assert.ok(BigNumber.isBigNumber(maxAmountResponse.fee), 'fee is not BigNumber');
                    assert.ok(BigNumber.isBigNumber(maxAmountResponse.amount), 'fee is not BigNumber');
                    assert.strictEqual(maxAmountResponse.coin, coin.getUnit());

                    console.log({
                        fee: maxAmountResponse.fee.toFixed(8),
                        amount: maxAmountResponse.amount.toFixed(8)
                    });
                } catch (error) {
                    if (cases.defaultMaxAmount) {
                        console.log(balanceAmount);

                        throw error;
                    }

                    assert.strictEqual(error.code, Exceptions.ExceptionCodes.Insufficient_Funds);
                }
            });
        });
    }
});
