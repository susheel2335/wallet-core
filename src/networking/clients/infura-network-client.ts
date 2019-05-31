import { forEach, map, filter } from 'lodash';
import BigNumber from 'bignumber.js';
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { Coin, Wallet, Constants, Utils } from '../../';
import { TAdapterOption, Infura, Etherscan } from '../api';
import { wrapLimiterMethod as infuraWrap } from '../limmiters/infura';
import { wrapLimiterMethod as etherscanWrap } from '../limmiters/etherscan';
import { NetworkClient, IEthereumNetworkClient, GasPrice } from './network-client';
import { ITrackerClient, InfuraTrackerProvider } from './tracker';

const EtherscanApi = require('etherscan-api');

/**
 * @TODO This is a temporary mechanism that helps to track blocks
 */
export default class InfuraNetworkClient extends NetworkClient implements IEthereumNetworkClient {
    protected client: AxiosInstance;
    protected etherchainClient: AxiosInstance;
    protected etherscanClient;

    protected trackerClient: InfuraTrackerProvider;

    public constructor(coin: Coin.CoinInterface, options: TAdapterOption) {
        super(coin, options);

        if (false === (coin instanceof Coin.Defined.Ethereum)) {
            throw new Error('Invalid Coin. Just ETH Coin');
        }

        const { network = undefined } = this.getOptions();

        this.client = Axios.create({
            baseURL: options.url,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.etherchainClient = Axios.create({
            baseURL: 'https://www.etherchain.org/api',
            timeout: 10000,
        });

        this.etherscanClient = EtherscanApi.init(Constants.ETHERSCAN_API_KEY, network);
    }


    protected sendRequest(method: string, params?: any[], options: AxiosRequestConfig = {}): Promise<Infura.JsonRPCResponse> {
        params = Infura.transformRequestParams(params);

        return infuraWrap(async () => {
            const requestData = {
                jsonrpc: "2.0",
                id: 1,
                method: method,
                params: params,
            };

            const { data } = await this.client.request({
                ...options,
                method: 'POST',
                data: requestData,
            });

            return data;
        });
    }


    public async getTx(txid: string): Promise<Wallet.Entity.EtherTransaction | undefined> {
        const response = await this.sendRequest('eth_getTransactionByHash', [txid]);

        const tx: Infura.Transaction = response.result;
        if (!tx) {
            return undefined;
        }

        const responseTx = {
            coin: this.coin.getUnit(),
            txid: tx.hash,
            scheme: Coin.TransactionScheme.FROM_TO,
            value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
            gasPrice: new BigNumber(tx.gasPrice).div(Constants.WEI_PER_COIN).toString(),
            gasLimit: tx.gas,
            to: tx.to,
            from: tx.from,
            data: tx.input,
            nonce: new BigNumber(tx.nonce).toNumber(),
        } as Wallet.Entity.EtherTransaction;

        if (tx.blockNumber) {
            return this.checkAndMapTxReceipt(responseTx);
        }

        return responseTx;
    }

    public async getInfo(): Promise<plarkcore.BlockchainInfo> {
        const response: Infura.JsonRPCResponse = await this.sendRequest('eth_blockNumber');

        const { network = undefined } = this.getOptions();

        return {
            blockHeight: new BigNumber(response.result).toNumber(),
            difficulty: 0,
            testnet: network !== 'mainnet',
            network: network,
        };
    }


    public async getTxReceipt(txid: string): Promise<Infura.TransactionReceipt | undefined> {
        const response: Infura.JsonRPCResponse = await this.sendRequest(
            'eth_getTransactionReceipt',
            [txid],
        );

        return response.result as Infura.TransactionReceipt;
    }


    public async checkAndMapTxReceipt(tx: Wallet.Entity.EtherTransaction): Promise<Wallet.Entity.EtherTransaction> {
        const txReceipt: Infura.TransactionReceipt | undefined = await this.getTxReceipt(tx.txid);

        if (txReceipt) {
            const receiptProps = {
                blockHash: txReceipt.blockHash,
                blockHeight: new BigNumber(txReceipt.blockNumber).toNumber(),
                gasUsed: new BigNumber(txReceipt.gasUsed).toString(),
                receiptStatus: !!(new BigNumber(txReceipt.status).toNumber()),
            };

            return Object.assign({}, tx, receiptProps);
        }

        return tx;
    }


    public async getBlock(blockHash: string): Promise<Wallet.Entity.Block> {
        const response = await this.sendRequest('eth_getBlockByHash', [blockHash, true]);

        const blockRes: Infura.Block = response.result;
        if (!blockRes) {
            return;
        }

        return {
            hash: blockRes.hash,
            time: new BigNumber(blockRes.timestamp).times(1000).toNumber(),
            height: new BigNumber(blockRes.number).toNumber(),
            txids: map(blockRes.transactions, tx => tx.hash),
            original: blockRes,
        } as Wallet.Entity.Block;
    }


    public async getBlockByNumber(
        blockNumber: number | string,
        options: AxiosRequestConfig = {},
    ): Promise<Wallet.Entity.Block | undefined> {
        const response = await this.sendRequest('eth_getBlockByNumber', [blockNumber, true], options);

        const blockRes: Infura.Block = response.result;
        if (!blockRes) {
            return;
        }

        return {
            hash: blockRes.hash,
            time: new BigNumber(blockRes.timestamp).times(1000).toNumber(),
            height: new BigNumber(blockRes.number).toNumber(),
            txids: map(blockRes.transactions, tx => tx.hash),
            original: blockRes,
        } as Wallet.Entity.Block;
    }


    public async getGasPrice(): Promise<GasPrice> {
        const standardGasPrice = new BigNumber(4).div(Constants.WEI_PER_COIN);
        const defaultGasPrice = {
            low: standardGasPrice,
            standard: standardGasPrice.times(2),
            high: standardGasPrice.times(4),
        };

        const data = await this.sendRequest('eth_gasPrice');

        const gasPrices = new BigNumber(data.result).div(Constants.GWEI_PER_COIN);

        if (!gasPrices) {
            return defaultGasPrice;
        }

        return {
            low: gasPrices.div(2),
            standard: gasPrices,
            high: gasPrices.times(4),
        } as GasPrice;
    }


    public async estimateGas(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
        const { to, from, value, data, gas, gasPrice } = options;

        const requestData: any = {};
        if (to) {
            requestData.to = typeof to === 'string' ? to : to.toString();
        }

        if (from) {
            requestData.from = typeof from === 'string' ? from : from.toString();
        }

        requestData.value = value ? Utils.numberToHex(value.times(Constants.WEI_PER_COIN)) : 0;
        requestData.gas = gas ? Utils.numberToHex(gas) : undefined;
        requestData.gasPrice = gasPrice ? Utils.numberToHex(gasPrice) : undefined;
        requestData.data = data;

        const response = await this.sendRequest('eth_estimateGas', [requestData]);

        return new BigNumber(response.result as string);
    }


    public async broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        const data = await this.sendRequest('eth_sendRawTransaction', [transaction.toBuffer()]);

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.result as string;
    }


    public getAddressTxs(address: string): Promise<Wallet.Entity.EtherTransaction[]> {
        return etherscanWrap(async () => {
            const txList: Wallet.Entity.EtherTransaction[] = [];

            try {
                const response = await this.etherscanClient.account
                    .txlist(address.toLowerCase(), 1, 'latest', 'asc');

                forEach(response.result, (tx: Etherscan.Transaction) => {
                    const txData = Etherscan.toWalletTx(this.coin, tx);
                    txList.push(txData);
                });
            } catch (error) {
            }

            try {
                const responseInternal = await this.etherscanClient.account
                    .txlistinternal(undefined, address.toLowerCase(), 1, 'latest', 'asc');

                forEach(responseInternal.result, (tx: Etherscan.InternalTransaction) => {
                    const txData = Etherscan.internalToWalletTx(this.coin, tx);
                    txList.push(txData);
                });
            } catch (error) {
            }

            return txList;
        });
    }


    public getTracker(): ITrackerClient {
        if (!this.trackerClient) {
            this.trackerClient = new InfuraTrackerProvider(this);
        }

        return this.trackerClient;
    }


    public destruct() {
        if (this.trackerClient) {
            this.trackerClient.destruct();

            delete this.trackerClient;
        }
    }
}
