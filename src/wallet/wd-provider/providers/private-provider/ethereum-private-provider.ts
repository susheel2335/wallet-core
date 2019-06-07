import { filter, get } from 'lodash';
import BigNumber from 'bignumber.js';
import * as Networking from 'networking';
import * as Coin from 'coin';
import { Constants } from '../../../../';
import { Entity } from '../../../';
import { AbstractPrivateProvider } from './abstract-private-provider';

type IEthereumNetworkClient = Networking.Clients.IEthereumNetworkClient;

export class EthereumPrivateProvider extends AbstractPrivateProvider {

    /**
     * @param {WalletAddress}   fromAddress
     */
    public getTxNonce(fromAddress: Entity.WalletAddress) {
        return filter(
            this.wdProvider.tx.list(),
            (tx: Entity.EtherTransaction) => tx.from.toLowerCase() === fromAddress.address.toLowerCase(),
        ).length;
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

    /**
     * @param {FeeTypes} feeType
     *
     * @returns {Promise<BigNumber>}
     */
    public async getGasPrice(feeType: Constants.FeeTypes = Constants.FeeTypes.Medium): Promise<BigNumber> {
        const networkClient = this.wdProvider.getNetworkProvider().getClient(0);

        const gasPrices: plarkcore.GasPrice = await (networkClient as IEthereumNetworkClient)
            .getGasPrice();

        let gasPriceGWEI = gasPrices.standard;
        switch (feeType) {
            case Constants.FeeTypes.High:
                gasPriceGWEI = gasPrices.high;
                break;

            case Constants.FeeTypes.Low:
                gasPriceGWEI = gasPrices.low;
                break;
        }

        return gasPriceGWEI;
    }

    /**
     * @param {BigNumber} value
     * @param {Address} address
     * @param {FeeTypes} feeType
     *
     * @returns {Promise<CalculateFeeResponse>}
     */
    public async calculateFee(
        value: BigNumber,
        address: Coin.Key.Address,
        feeType: Constants.FeeTypes = Constants.FeeTypes.Medium,
    ): Promise<plarkcore.CalculateFeeResponse> {
        const [gasPrice, gasLimit]: BigNumber[] = await Promise.all([
            this.getGasPrice(feeType),
            this.getGasLimit({ to: address, value: value }),
        ]);

        return {
            fee: gasLimit.times(gasPrice.div(Constants.GWEI_PER_COIN)),
            coin: this.getCoin().getUnit(),
            feeType: feeType,
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
        };
    }

    /**
     * Method to calculate max value and fee to send
     *
     * @param {Address}     address
     * @param {FeeTypes}    feeType
     * @param {any}         options
     *
     * @return {Promise<CalculateMaxResponse>}
     */
    public calculateMax<Options = any>(
        address: Coin.Key.Address,
        feeType: Constants.FeeTypes,
        options?: Options,
    ): Promise<plarkcore.CalculateMaxResponse> {
        throw new Error('calculateMax for EthereumPrivateProvider did not implemented, yet.');
    }

    /**
     * @param {Address} address
     * @param {BigNumber} value
     * @param {FeeTypes} feeType
     * @param {plarkcore.eth.EthTransactionRequestOptions} options
     *
     * @returns {Transaction}
     */
    public async createTransaction<Options = plarkcore.eth.EthTransactionRequestOptions>(
        address: Coin.Key.Address,
        value: BigNumber,
        feeType: Constants.FeeTypes = Constants.FeeTypes.Medium,
        options?: Options,
    ): Promise<Coin.Transaction.Transaction> {

        const transactionData: Buffer | undefined = get(options, 'data');
        let gasPrice: BigNumber | undefined = get(options, 'gasPrice');
        let gasLimit: BigNumber | undefined = get(options, 'gasLimit');

        let coin = this.wdProvider.coin as Coin.Defined.Ethereum;
        let balance = this.wdProvider.balance;

        let [addressFrom] = this.wdProvider.address.list();

        const privateNodeFrom = this.deriveAddressNode(addressFrom);
        const addressBalance = balance.addrBalances[addressFrom.address];

        const currentBalance = addressBalance.receive
            .minus(addressBalance.spend)
            .minus(addressBalance.unconfirmed);

        if (currentBalance.isLessThan(value)) {
            throw new Error('Insufficient funds');
        }

        let txBuilder = new Coin.Transaction.EthereumTransactionBuilder(coin);
        txBuilder.to = address;
        txBuilder.value = value;
        txBuilder.nonce = this.getTxNonce(addressFrom);

        if (transactionData) {
            txBuilder.data = transactionData;
        }

        let privateKeys: Coin.Key.Private[] = [privateNodeFrom.getPrivateKey()];


        if (!gasPrice || gasPrice.isLessThanOrEqualTo(0)) {
            gasPrice = await this.getGasPrice(feeType);
        }

        if (!gasLimit || gasLimit.isLessThanOrEqualTo(0)) {
            gasLimit = await this.getGasLimit({ to: address, value: value, data: transactionData });
        }

        txBuilder.gasPrice = gasPrice.div(Constants.GWEI_PER_COIN);
        txBuilder.gasLimit = gasLimit.toNumber();

        return txBuilder.buildSigned(privateKeys);
    }
}
