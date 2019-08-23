import { forEach, filter } from 'lodash';
import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import coinSelect, { CoinSelectResult, coinSplit } from 'coinselect';
import * as Coin from '../../../../coin';
import * as Constants from '../../../../constants';
import Exceptions from '../../../../exceptions';
import HD from '../../../../hd';
import { calculateBalance, Entity } from '../../../index';
import FeeProviderInterface, { AbstractFeeProvider } from './fee-provider.interface';

function fee2Sat(feeRate: BigNumber): number {
    return feeRate.times(Constants.SATOSHI_PER_COIN).toNumber();
}

export default class BIPFeeProvider extends AbstractFeeProvider implements FeeProviderInterface<plarkcore.bip.BIPFeeOptions> {

    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        const coin = this.getCoin() as Coin.BIPGenericCoin;
        let networkClient = this.wdProvider.getNetworkProvider().getClient(0);

        try {
            if ('getFeesPerByte' in networkClient && typeof networkClient['getFeesPerByte'] === 'function') {
                const promise = networkClient['getFeesPerByte']() as plarkcore.FeeRecord;

                return await Promise.resolve(promise);
            }
        } catch (e) {
        }

        return {
            low: coin.lowFeePerByte,
            medium: coin.defaultFeePerByte,
            high: coin.highFeePerByte,
        };
    }



    public getFeeOptions(feeType: plarkcore.FeeType, record?: plarkcore.FeeRecord): plarkcore.bip.BIPFeeOptions {
        const coin = this.getCoin() as Coin.BIPGenericCoin;

        if (!record) {
            record = {
                low: coin.lowFeePerByte,
                medium: coin.defaultFeePerByte,
                high: coin.highFeePerByte,
            };
        }

        let feeRate = record[feeType];
        if (feeRate.isLessThan(coin.minFeePerByte)) {
            feeRate = coin.defaultFeePerByte;
        }

        return {
            feeType: feeType,
            feeRate: feeRate,
        };
    }



    public calculateFee(
        value: BigNumber,
        options: plarkcore.bip.BIPFeeOptions,
        address?: string,
    ): plarkcore.CalculateFeeResponse {
        const balance = this.wdProvider.balance;

        if (!address) {
            address = this.wdProvider.address.last(HD.BIP44.AddressType.CHANGE).address;
        }

        let { inputs = [], outputs = [], fee = 0 }
            = this.calculateOptimalInputs(balance, address, value, options);

        return {
            fee: new BigNumber(fee).div(Constants.SATOSHI_PER_COIN),
            coin: this.getCoin().getUnit(),
            inputCount: inputs.length,
            outputCount: outputs.length,
        };
    }



    public calculateMaxAmount(
        options: plarkcore.bip.BIPFeeOptions,
        address?: string,
    ): plarkcore.CalculateMaxResponse {
        const coin = this.wdProvider.coin as Coin.BIPGenericCoin;
        const balance = this.wdProvider.balance;

        if (!address) {
            address = this.wdProvider.address.last(HD.BIP44.AddressType.CHANGE).address;
        }

        const possibleInputs: Entity.UnspentTXOutput[]
            = filter(balance.utxo, { confirmed: true }) as any[];

        const targetOutput = [{
            address: address,
            script: BitcoinJS.address.toOutputScript(address, coin.networkInfo()),
        }];

        const { inputs = [], outputs = [], fee = 0 }
            = coinSplit(possibleInputs, targetOutput, fee2Sat(options.feeRate));

        const feeNum = new BigNumber(fee.toFixed(8)).div(Constants.SATOSHI_PER_COIN);
        const balanceNum = new BigNumber(calculateBalance(this.wdProvider.balance));

        if (!inputs || inputs.length === 0) {
            throw new Exceptions.InsufficientFundsException();
        }

        if (feeNum.isGreaterThanOrEqualTo(balanceNum)) {
            throw new Exceptions.InsufficientFundsException();
        }

        return {
            fee: feeNum,
            amount: balanceNum.minus(feeNum),

            coin: coin.getUnit(),
            balance: balanceNum.toString(),
        };
    }



    /**
     * @param {WDBalance}                       balance
     * @param {string}                          address
     * @param {BigNumber}                       value
     * @param {plarkcore.bip.BIPFeeOptions}     options
     *
     * @return {CoinSelectResult}
     */
    public calculateOptimalInputs(
        balance: Entity.WDBalance,
        address: string,
        value: BigNumber,
        options: plarkcore.bip.BIPFeeOptions,
    ): CoinSelectResult {
        const coin = this.getCoin() as Coin.BIPGenericCoin;

        const possibleInputs: Entity.UnspentTXOutput[]
            = filter(balance.utxo, { confirmed: true }) as any[];

        const targetOutput = [{
            address: address,
            script: BitcoinJS.address.toOutputScript(address, coin.networkInfo()),
            value: fee2Sat(value),
        }];

        return coinSelect(possibleInputs, targetOutput, fee2Sat(options.feeRate));
    }
}
