import BigNumber from 'bignumber.js';
import Bottleneck from 'bottleneck';
import { forEach, orderBy } from 'lodash';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Coin from '../../coin';
import * as Wallet from '../../wallet';
import { Insight } from '../api';

import { NetworkClient } from './network-client';
import { InsightTrackerProvider } from './tracker';

export default class InsightNetworkClient extends NetworkClient {
    protected client: AxiosInstance;
    protected limiter: Bottleneck;

    protected trackerClient?: plarkcore.ITrackerClient;

    /**
     * InsightNetworkClient constructor.
     *
     * @param {CoinInterface}       coin
     * @param {plarkcore.AdapterOption}      options
     */
    public constructor(coin: Coin.CoinInterface, options: plarkcore.AdapterOption) {
        if (false === (coin instanceof Coin.BIPGenericCoin)) {
            throw new Error('Insight network for BIP Coin only');
        }

        super(coin, options);

        this.client = Axios.create({
            baseURL: this.getApiUrl(),
            timeout: 10000,
        });

        this.limiter = new Bottleneck(1, 500);
    }

    /**
     * This function return transaction by TXID it if exists in blockchain network
     *
     * @param {string}      txid
     *
     * @return {Promise<BIPTransaction|undefined>}
     */
    public async getTx(txid: string): Promise<Wallet.Entity.BIPTransaction | undefined> {
        const data: any = await this.sendRequest(`/tx/${txid}`);
        const tx: Insight.Transaction = data as Insight.Transaction;

        return tx ? Insight.toWalletTx(tx, this.coin) : undefined;
    }


    /**
     * @return {Promise<plarkcore.FeeRecord>}
     */
    public async getFeesPerKB(): Promise<plarkcore.FeeRecord> {
        const resolveFeePerByte = (data, index, defaultFeeProp: string): BigNumber => {
            if (data[index] > 0) {
                return new BigNumber(data[index]).div(1024).decimalPlaces(8);
            }

            return this.coin[defaultFeeProp];
        };

        try {
            const data = await this.sendRequest(
                '/utils/estimatefee?nbBlocks=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
            );

            return {
                low: resolveFeePerByte(data, 12, 'lowFeePerByte'),
                standard: resolveFeePerByte(data, 5, 'defaultFeePerByte'),
                high: resolveFeePerByte(data, 1, 'highFeePerByte'),
            };
        } catch (error) {
            return {
                low: (this.coin as Coin.BIPGenericCoin).lowFeePerByte,
                standard: (this.coin as Coin.BIPGenericCoin).defaultFeePerByte,
                high: (this.coin as Coin.BIPGenericCoin).highFeePerByte,
            };
        }
    }

    public async getInfo(): Promise<plarkcore.BlockchainInfo> {
        const info = await this.sendRequest<Insight.BlockchainInfo>('/status');

        return {
            blockHeight: info.info.blocks,
            difficulty: info.info.difficulty,
            testnet: info.info.testnet,
            network: info.info.network,
        };
    }


    public async getBlock(blockHash: string): Promise<Wallet.Entity.Block> {
        const block: Insight.Block = await this.sendRequest<Insight.Block>(`/block/${blockHash}`);

        return {
            hash: block.hash,
            height: block.height,
            time: block.time * 1000,
            txids: block.tx,
            original: block,
        } as Wallet.Entity.Block;
    }


    public async broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        const data = await this.sendRequest<any>('/tx/send', {
            rawtx: transaction.toBuffer().toString('hex'),
        });

        return data.txid as string;
    }


    public getAddressTxs(address: string): Promise<Wallet.Entity.BIPTransaction[]> {
        return this.pureGetAddrsTxs([address], 0, 50);
    }


    public getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]> {
        return this.pureGetAddrsTxs(addrs, 0, 50);
    }


    public getTracker(): plarkcore.ITrackerClient {
        if (!this.trackerClient) {
            this.trackerClient = new InsightTrackerProvider(this);
        }

        return this.trackerClient;
    }


    public destruct(): void {
        if (this.trackerClient) {
            this.trackerClient.onDisconnect(() => {
                delete this.trackerClient;
            });

            this.trackerClient.destruct();
        }

        this.limiter.stopAll();
        delete this.client;
    }


    protected async pureGetAddrsTxs(addrs: string[], from: number = 0, limit: number = 50): Promise<Wallet.Entity.BIPTransaction[]> {
        if (!addrs.length) {
            throw new Error('There is no addresses to request!');
        }

        const data: any = await this
            .sendRequest<Insight.Transaction[]>(`/addrs/${addrs.join(',')}/txs?from=${from}&to=${from + limit}`);

        const rawTxs: Insight.Transaction[] = data.items;
        const txList: Wallet.Entity.BIPTransaction[] = [];

        const extractTxCallback = (tx: Insight.Transaction) => {
            txList.push(Insight.toWalletTx(tx, this.coin));
        };

        forEach(orderBy(rawTxs, 'blockheight', 'asc'), extractTxCallback);

        return txList;
    }


    protected wrapperLimiter<R>(cb: () => PromiseLike<R>, priority: number = 5): Promise<R> {
        return this.limiter.schedulePriority(priority, cb);
    }


    protected sendRequest<R>(url: string, postParams: any = undefined): Promise<R> {
        return this.wrapperLimiter<R>(async (): Promise<R> => {
            const response: AxiosResponse = await this.client.request({
                url: url,
                method: postParams ? 'POST' : 'GET',
                data: postParams ? postParams : undefined,
            });

            return response.data as R;
        });
    }
}
