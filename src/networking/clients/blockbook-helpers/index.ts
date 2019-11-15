import BigNumber from 'bignumber.js';
import { union, get } from 'lodash';
import { blockbook } from '../../api';
import { BlockbookNetworkClient } from '../blockbook-network-client';
import WSClient from './ws-client';

/**
 * FeeHelper
 */
class FeeHelper {
    protected client: BlockbookNetworkClient;
    protected feeCache?: plarkcore.FeeRecord;
    protected feeTimeout?: number;

    public constructor(client: BlockbookNetworkClient) {
        this.client = client;
    }

    public async getFee(): Promise<plarkcore.FeeRecord> {
        if (this.isFeeExpired()) {
            this.feeCache = {
                low: await this.resolveFee(12, 'lowFeePerKB'),
                medium: await this.resolveFee(6, 'defaultFeePerKB'),
                high: await this.resolveFee(1, 'highFeePerKB'),
            };

            this.feeTimeout = new Date().getTime();
        }

        return this.feeCache;
    }


    protected resolveFee = async (blocks: number, type: string) => {
        try {
            const fee = await this.client.getWSClient().send('estimateSmartFee', [blocks, false]);
            const value = new BigNumber(fee);

            if (value.isGreaterThan(0)) {
                return value;
            }
        } catch (error) {
        }

        return this.client.coin[type];
    };

    protected isFeeExpired(): boolean {
        if (!this.feeTimeout || !this.feeCache) {
            return true;
        }

        return this.feeTimeout - 3 * 60 * 1000 <= new Date().getTime();
    }
}


/**
 * TransactionHelper
 */
class TransactionHelper {
    protected client: BlockbookNetworkClient;

    public constructor(client: BlockbookNetworkClient) {
        this.client = client;
    }


    public async getTx(txid: string): Promise<plarkcore.bip.BIPTransaction | undefined> {
        try {
            const tx = await this.client.getWSClient()
                .send<blockbook.Transaction>('getDetailedTransaction', [txid]);

            return blockbook.toWalletTx(tx, this.client.coin);
        } catch (error) {
            throw error;
        }
    }


    public async getBulkAddrsTxs(addrs: string[]): Promise<plarkcore.bip.BIPTransaction[]> {
        const info = await this.client.getInfo();

        const params = {
            start: info.blockHeight,
            end: 0,
            from: 0,
            to: 1000,
            queryMempoolOnly: true,
        };

        const data = await Promise.all([
            await this.client.getWSClient().send(
                'getAddressHistory',
                [addrs, { ...params, queryMempoolOnly: true }],
            ),
            await this.client.getWSClient().send(
                'getAddressHistory',
                [addrs, { ...params, queryMempoolOnly: false }],
            ),
        ]);

        const items = union(
            get(data, '[0].items', []),
            get(data, '[1].items', []),
        );

        return items.map(
            (txInfo: blockbook.ExtendedTransaction) => blockbook.toWalletTx(txInfo.tx, this.client.coin),
        );
    }


    public async sendTransaction(rawTransactionHex: string): Promise<string> {
        return this.client.getWSClient().send<string>('sendTransaction', [rawTransactionHex]);
    }
}


export { WSClient, TransactionHelper, FeeHelper };
