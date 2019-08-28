import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import * as Coin from '../../coin';
import { NetworkClient } from './network-client';
import { blockbook } from '../api';
import { BlockbookTrackerProvider } from './tracker';
import { FeeHelper, WSClient, TransactionHelper } from './blockbook-helpers';


export default class BlockbookNetworkClient extends NetworkClient {
    protected client: AxiosInstance;

    protected feeHelper: FeeHelper;
    protected txHelper: TransactionHelper;
    protected wsClient: WSClient;
    protected trackerClient?: plarkcore.ITrackerClient;

    public constructor(coin: Coin.CoinInterface, options: plarkcore.AdapterOption) {
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


    public async sendApiRequest<R>(url: string, postParams: any = undefined): Promise<R> {
        const response: AxiosResponse = await this.client.request({
            url: url,
            method: postParams ? 'POST' : 'GET',
            data: postParams ? postParams : undefined,
        });

        return response.data as R;
    }


    public getWSClient(): WSClient {
        return this.wsClient;
    }


    public async getFeesPerByte(): Promise<plarkcore.FeeRecord> {
        return this.feeHelper.getFee();
    }

    public async fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        return this.feeHelper.getFee();
    }

    public async getInfo(): Promise<plarkcore.BlockchainInfo> {
        const info = await this.getWSClient().send('getInfo');
        
        return {
            blockHeight: info.blocks,
            difficulty: 0,
            testnet: info.testnet,
            network: info.network,
        };
    }


    public async getBlock(blockHash: string): Promise<plarkcore.blockchain.CommonBlock> {
        let pageIndex = 1;

        const firstBlockPage = await this.sendApiRequest<blockbook.Block>(`/v2/block/${blockHash}`);

        const blockData = {
            hash: firstBlockPage.hash,
            height: firstBlockPage.height,
            time: firstBlockPage.time * 1000,
            txids: firstBlockPage.txs.map(tx => tx.txid),
            original: undefined,
        } as plarkcore.blockchain.CommonBlock;


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


    public async getTx(txid: string): Promise<plarkcore.bip.BIPTransaction | undefined> {
        return this.txHelper.getTx(txid);
    }


    public async getBulkAddrsTxs(addrs: string[]): Promise<plarkcore.bip.BIPTransaction[]> {
        return this.txHelper.getBulkAddrsTxs(addrs);
    }


    public async getAddressTxs(address: string): Promise<plarkcore.bip.BIPTransaction[]> {
        return this.txHelper.getBulkAddrsTxs([address]);
    }


    public broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        return this.txHelper.sendTransaction(transaction.toBuffer().toString('hex'));
    }


    /** @deprecated */
    public getTracker(): plarkcore.ITrackerClient {
        if (!this.trackerClient) {
            this.trackerClient = new BlockbookTrackerProvider(this);
        }

        return this.trackerClient;
    }


    public createTracker(): plarkcore.ITrackerClient {
        return new BlockbookTrackerProvider(this);
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
