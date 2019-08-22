import BigNumber from 'bignumber.js';
import * as Coin from '../../../../coin';
import * as Constants from '../../../../constants';
import FeeProviderInterface, { AbstractFeeProvider } from './fee-provider.interface';

function fee2Sat(feeRate: BigNumber): number {
    return feeRate.times(Constants.SATOSHI_PER_COIN).toNumber();
}

export default class BIPFeeProvider extends AbstractFeeProvider implements FeeProviderInterface<plarkcore.bip.BIPFeeOptions> {

    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        const coin = this.wdProvider.coin as Coin.BIPGenericCoin;
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
        const coin = this.wdProvider.coin as Coin.BIPGenericCoin;

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
        return undefined;
    }


    public calculateMaxAmount(
        options: plarkcore.bip.BIPFeeOptions,
        address?: string,
    ): plarkcore.CalculateMaxResponse {
        return undefined;
    }

}
