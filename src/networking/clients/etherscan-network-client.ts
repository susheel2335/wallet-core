import { forEach } from 'lodash';
import BigNumber from 'bignumber.js';
import EtherscanApi, { EtherscanApiClient } from 'etherscan-api';
import { Coin, Wallet, Constants } from '../../';
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
        const res = await this.etherscanClient.proxy.eth_gasPrice();

        const estimateGasPrice = new BigNumber(res.result).div(Constants.WEI_PER_COIN);

        return {
            low: estimateGasPrice.div(2),
            standard: estimateGasPrice,
            high: estimateGasPrice.times(5),
        } as plarkcore.GasPrice;
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
     * @returns {Promise<EtherTransaction[]>}
     */
    public async getAddressTxs(address: string): Promise<Wallet.Entity.EtherTransaction[]> {

        let response: any;

        try {
            response = await this.etherscanClient.account.txlist(address.toLowerCase(), 1, 'latest', 'asc');
        } catch (error) {
            return [];
        }

        const txList: Wallet.Entity.EtherTransaction[] = [];

        forEach(response.result, (tx: Etherscan.Transaction) => {

            // @TODO Need review error of transaction
            if (+tx.isError) return;

            const txData: Wallet.Entity.EtherTransaction = {
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
            } as Wallet.Entity.EtherTransaction;

            txList.push(txData);
        });

        return txList;
    }
}
