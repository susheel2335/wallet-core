import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import * as Coin from '../../coin';
import * as Wallet from '../../wallet';
import { FeeRecord, NetworkClient } from './network-client';
import { TAdapterOption, blockbook } from '../api';
import { ITrackerClient, BlockbookTrackerProvider } from './tracker';
import { FeeHelper, WSClient, TransactionHelper } from './blockbook-helpers';


export default class BlockbookNetworkClient extends NetworkClient {
    protected client: AxiosInstance;

    protected feeHelper: FeeHelper;
    protected txHelper: TransactionHelper;
    protected wsClient: WSClient;
    protected trackerClient?: ITrackerClient;

    public constructor(coin: Coin.CoinInterface, options: TAdapterOption) {
        if (false === (coin instanceof Coin.BIPGenericCoin)) {
            throw new Error('Insight network for BIP Coin only');
        }

        super(coin, options);

        this.client = Axios.create({
            baseURL: this.getApiUrl(),
            timeout: 10000,
        });

        this.wsClient = new WSClient(this.getWSUrl());
        this.feeHelper = new FeeHelper(this);
        this.txHelper = new TransactionHelper(this);
    }


    public async sendApiRequest<R>(url: string, postParams: any = null): Promise<R> {
        const response: AxiosResponse = await this.client.request({
            url: url,
            method: postParams ? 'POST' : 'GET',
            data: postParams ? postParams : null,
        });

        return response.data as R;
    }


    public getWSClient(): WSClient {
        return this.wsClient;
    }


    public async getFeesPerKB(): Promise<FeeRecord> {
        return this.feeHelper.getFee();
    }


    public async getBlock(blockHash: string): Promise<Wallet.Entity.Block> {
        let pageIndex = 1;

        const firstBlockPage = await this.sendApiRequest<blockbook.Block>(`/v2/block/${blockHash}`);

        const blockData = {
            hash: firstBlockPage.hash,
            height: firstBlockPage.height,
            time: firstBlockPage.time * 1000,
            txids: firstBlockPage.txs.map(tx => tx.txid),
            original: undefined,
        } as Wallet.Entity.Block;


        while (pageIndex > firstBlockPage.page) {
            pageIndex++;
            const blockPage = await this.sendApiRequest<blockbook.Block>(`/v2/block/${blockHash}?page=${pageIndex}`);

            blockData.txids = [
                ...blockData.txids,
                ...blockPage.txs.map(tx => tx.txid),
            ];
        }

        delete firstBlockPage.txs;
        blockData.original = firstBlockPage;

        return blockData;
    }


    public async getTx(txid: string): Promise<Wallet.Entity.BIPTransaction | undefined> {
        return this.txHelper.getTx(txid);
    }

    public async getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.BIPTransaction[]> {
        return this.txHelper.getBulkAddrsTxs(addrs);
    }

    public async getAddressTxs(address: string): Promise<Wallet.Entity.BIPTransaction[]> {
        return this.txHelper.getBulkAddrsTxs([address]);
    }


    public broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        return this.txHelper.sendTransaction(transaction.toBuffer().toString('hex'));
    }


    public getTracker(): ITrackerClient {
        if (!this.trackerClient) {
            this.trackerClient = new BlockbookTrackerProvider(this);
        }

        return this.trackerClient;
    }


    public destruct() {
        super.destruct();

        if (this.trackerClient) {
            this.trackerClient.destruct();
            delete this.trackerClient;
        }

        this.wsClient.destruct();
    }
}
