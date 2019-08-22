import BigNumber from 'bignumber.js';
import * as Constants from '../../../../constants';
import * as Networking from '../../../../networking';
import FeeProviderInterface, { AbstractFeeProvider } from './fee-provider.interface';

type IEthereumNetworkClient = Networking.Clients.IEthereumNetworkClient;

export default class EtherFeeProvider
    extends AbstractFeeProvider
    implements FeeProviderInterface<plarkcore.eth.EthFeeOptions> {


    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        const networkClient = this.wdProvider.getNetworkProvider().getClient(0);

        return await (networkClient as IEthereumNetworkClient).getGasPrice();
    }

    /**
     * @param {plarkcore.eth.EstimateGasRequestOptions} options
     *
     * @returns {Promise<BigNumber>}
     */
    public async getGasLimit(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
        let { value, to, from, data, gas, gasPrice } = options;

        if (!value) {
            value = new BigNumber(0);
        }

        if (!to) {
            return Constants.MIN_GAS_LIMIT;
        }

        const networkClient = this.wdProvider.getNetworkProvider().getClient(0);
        try {
            return await (networkClient as IEthereumNetworkClient).estimateGas({
                to: to ? to.toString() : undefined,
                from: from ? from.toString() : undefined,
                value: value,
                data: data,
                gas: gas,
                gasPrice: gasPrice,
            });
        } catch (error) {
            return Constants.MIN_GAS_LIMIT;
        }
    }


    public getFeeOptions(feeType: plarkcore.FeeType, record?: plarkcore.FeeRecord): plarkcore.eth.EthFeeOptions {
        const standardGasPrice = new BigNumber(4).div(Constants.WEI_PER_COIN);
        const defaultGasPrice = {
            low: standardGasPrice,
            medium: standardGasPrice.times(2),
            high: standardGasPrice.times(4),
        };

        if (!record) {
            record = defaultGasPrice;
        }

        return {
            feeType: feeType,
            gasPrice: record[feeType],
            gasLimit: Constants.MIN_GAS_LIMIT,
        };
    }


    public calculateFee(
        value: BigNumber,
        options: plarkcore.eth.EthFeeOptions,
        address?: string,
    ): plarkcore.CalculateFeeResponse {
        return undefined;
    }


    public calculateMaxAmount(
        options: plarkcore.eth.EthFeeOptions,
        address?: string,
    ): plarkcore.CalculateMaxResponse {
        return undefined;
    }
}
