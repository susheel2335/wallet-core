import { forEach } from 'lodash';
import BigNumber from 'bignumber.js';
import EtherscanApi, { EtherscanApiClient } from 'etherscan-api';
import * as Coin from '../../coin';
import * as Constants from '../../constants';
import { Etherscan } from '../api';
import { NetworkClient, IEthereumNetworkClient } from './network-client';


export default class EtherscanNetworkClient extends NetworkClient implements IEthereumNetworkClient {
    protected etherscanClient: EtherscanApiClient;

    /**
     * Constructor of EtherscanNetworkClient.
     *
     * @param {CoinInterface} coin
     * @param {plarkcore.AdapterOption} options
     */
    public constructor(coin: Coin.CoinInterface, options: plarkcore.AdapterOption) {
        super(coin, options);

        if (false === (coin instanceof Coin.Defined.Ethereum)) {
            throw new Error('Invalid Coin. Just ETH Coin');
        }

        const { network = undefined } = options;

        this.etherscanClient = EtherscanApi.init(Constants.ETHERSCAN_API_KEY, network);
    }


    /**
     * Get Transaction information by TX Hash
     *
     * @param {string} txid
     * @returns {CommonTransaction}
     */
    public async getTx(txid: string): Promise<plarkcore.blockchain.CommonTransaction | undefined> {
        let response: any;

        try {
            response = this.etherscanClient.proxy.eth_getTransactionByHash(txid);
        } catch (error) {
            return undefined;
        }

        const tx: Etherscan.Transaction = response.result;

        return {
            coin: this.coin.getUnit(),
            txid: tx.hash,
            blockHeight: new BigNumber(tx.blockNumber).toNumber(),
            blockTime: +tx.timeStamp * 1000,
            scheme: Coin.TransactionScheme.FROM_TO,
            value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
            gasPrice: new BigNumber(tx.gasPrice).div(Constants.WEI_PER_COIN).toString(),
            to: tx.to,
            from: tx.from,
            gasLimit: tx.gas,
            data: tx.input,
            nonce: tx.nonce,
        } as plarkcore.eth.EtherTransaction;
    }

    public getBlock(blockHash: string): Promise<plarkcore.blockchain.CommonBlock> {
        throw new Error('Must be implement');
    }

    public getInfo(): Promise<plarkcore.BlockchainInfo> {
        throw new Error('Must be implement');
    }

    /**
     * Find and get GAS Price of Ethereum
     *
     * @returns {Promise<plarkcore.GasPrice>}
     */
    public async getGasPrice(): Promise<plarkcore.GasPrice> {
        try {
            const res = await this.etherscanClient.proxy.eth_gasPrice();

            const estimateGasPrice = new BigNumber(res.result).div(Constants.WEI_PER_GWEI);

            return {
                low: estimateGasPrice,
                medium: estimateGasPrice.times(2),
                high: estimateGasPrice.times(5),
            } as plarkcore.GasPrice;
        } catch (e) {
            const standardGasPrice = new BigNumber(4);

            return {
                low: standardGasPrice,
                medium: standardGasPrice.times(2),
                high: standardGasPrice.times(4),
            };
        }
    }

    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        return this.getGasPrice();
    }

    public estimateGas(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
        throw new Error('Can not get Value');
    }


    /**
     * Broadcast Raw transaction to Etherscan NETWORK
     *
     * @param {Transaction} transaction
     * @returns {Promise<string>}
     */
    public async broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        const response = await this.etherscanClient.proxy
            .eth_sendRawTransaction(transaction.toBuffer().toString('hex'));

        return response.result as string;
    }


    /**
     * Get Address TXS
     *
     * @param {string} address
     * @returns {Promise<plarkcore.eth.EtherTransaction[]>}
     */
    public async getAddressTxs(address: string): Promise<plarkcore.eth.EtherTransaction[]> {

        let response: any;

        try {
            response = await this.etherscanClient.account.txlist(address.toLowerCase(), 1, 'latest', 'asc');
        } catch (error) {
            return [];
        }

        const txList: plarkcore.eth.EtherTransaction[] = [];

        forEach(response.result, (tx: Etherscan.Transaction) => {

            // @TODO Need review error of transaction
            if (+tx.isError) return;

            const txData: plarkcore.eth.EtherTransaction = {
                coin: this.coin.getUnit(),
                txid: tx.hash,
                blockHeight: new BigNumber(tx.blockNumber).toNumber(),
                blockTime: +tx.timeStamp * 1000,
                scheme: Coin.TransactionScheme.FROM_TO,
                value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
                gasPrice: new BigNumber(tx.gasPrice).div(Constants.WEI_PER_COIN).toString(),
                to: tx.to,
                from: tx.from,
                gasLimit: tx.gas,
                data: tx.input,
                nonce: tx.nonce,
            } as plarkcore.eth.EtherTransaction;

            txList.push(txData);
        });

        return txList;
    }
}
