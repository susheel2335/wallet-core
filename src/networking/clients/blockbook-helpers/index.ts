import BigNumber from 'bignumber.js';
import { union, get } from 'lodash';
import * as Wallet from '../../../wallet';
import { blockbook } from '../../api';
import { FeeRecord } from '../network-client';
import BlockbookNetworkClient from '../blockbook-network-client';
import WSClient from './ws-client';

/**
 * FeeHelper
 */
class FeeHelper {
    protected client: BlockbookNetworkClient;
    protected feeCache?: FeeRecord;
    protected feeTimeout?: number;

    public constructor(client: BlockbookNetworkClient) {
        this.client = client;
    }

    public async getFee(): Promise<FeeRecord> {
        if (this.isFeeExpired()) {
            this.feeCache = {
                low: await this.resolveFee(12, 'lowFeePerByte'),
                standard: await this.resolveFee(6, 'defaultFeePerByte'),
                high: await this.resolveFee(1, 'highFeePerByte'),
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
                return value.div(1024).decimalPlaces(8);
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


    public async getTx(txid: string): Promise<Wallet.Entity.BIPTransaction | undefined> {
        try {
            const tx = await this.client.getWSClient()
                .send<blockbook.Transaction>('getDetailedTransaction', [txid]);

            return blockbook.toWalletTx(tx, this.client.coin);
        } catch (error) {
            return;
        }
    }


    public async getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.BIPTransaction[]> {
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
