import BigNumber from 'bignumber.js';
import { CoinInterface } from '../../../../coin';
import { WDProvider } from '../../';

export default interface FeeProviderInterface<F = plarkcore.FeeOptions> {

    fetchFeeRecord(): Promise<plarkcore.FeeRecord>;

    getFeeOptions(feeType: plarkcore.FeeType, record?: plarkcore.FeeRecord): F;

    /**
     * @param {BigNumber}               value
     * @param {plarkcore.FeeOptions}    options
     * @param {string}                  address
     *
     * @return {CalculateFeeResponse}
     */
    calculateFee(
        value: BigNumber,
        options: F,
        address?: string,
    ): plarkcore.CalculateFeeResponse;

    /**
     * Method to calculate max value and fee to send
     *
     * @param {plarkcore.FeeOptions}    options
     * @param {string}                  address
     *
     * @return {CalculateMaxResponse}
     */
    calculateMaxAmount(
        options: F,
        address?: string,
    ): plarkcore.CalculateMaxResponse;
}

export abstract class AbstractFeeProvider {
    protected wdProvider: WDProvider;

    /**
     * @param {WDProvider} wdProvider
     */
    public constructor(wdProvider: WDProvider) {
        this.wdProvider = wdProvider;
    }

    protected getCoin(): CoinInterface {
        return this.wdProvider.coin;
    }

    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        const networkClient = this.wdProvider.getNetworkProvider().getClient(0);

        return networkClient.fetchFeeRecord();
    }
}
