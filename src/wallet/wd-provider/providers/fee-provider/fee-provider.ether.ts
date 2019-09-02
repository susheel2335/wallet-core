import BigNumber from 'bignumber.js';
import * as Constants from '../../../../constants';
import Exceptions from '../../../../exceptions';
import * as Networking from '../../../../networking';
import { calculateBalance } from '../../../helper';
import FeeProviderInterface, { AbstractFeeProvider } from './fee-provider.interface';

type IEthereumNetworkClient = Networking.Clients.IEthereumNetworkClient;

export default class EtherFeeProvider
    extends AbstractFeeProvider
    implements FeeProviderInterface<plarkcore.eth.EthFeeOptions> {

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
        if (!record) {
            const standardGasPrice = new BigNumber(4);

            record = {
                low: standardGasPrice,
                medium: standardGasPrice.times(2),
                high: standardGasPrice.times(4),
            };
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
        const { gasPrice, gasLimit } = options;

        return {
            fee: gasLimit.times(gasPrice.div(Constants.GWEI_PER_COIN)),
            coin: this.getCoin().getUnit(),
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
        };
    }


    public calculateMaxAmount(
        options: plarkcore.eth.EthFeeOptions,
        address?: string,
    ): plarkcore.CalculateMaxResponse {
        const { gasPrice, gasLimit } = options;

        const balance = new BigNumber(calculateBalance(this.wdProvider.balance));
        const fee = gasLimit.times(gasPrice.div(Constants.GWEI_PER_COIN));
        const amount = balance.minus(fee);

        if (amount.isLessThan(0)) {
            throw new Exceptions.InsufficientFundsException();
        }

        return {
            fee,
            amount,
            coin: this.getCoin().getUnit(),
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
            balance: balance.toNumber(),
        };
    }
}
