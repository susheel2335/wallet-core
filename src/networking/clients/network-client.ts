import BigNumber from 'bignumber.js';
import { forEach, map, findIndex } from 'lodash';
import { Coin, Wallet } from '../../';
import { Destructable } from '../../utils';
import { Api } from '../';
import * as Tracker from './tracker';

export { Tracker };

export type FeeType = 'low' | 'standard' | 'high';
export type FeeRecord = Record<FeeType, BigNumber>;
export type GasPrice = FeeRecord;

export interface INetworkClient extends Destructable {
    getCoin(): Coin.CoinInterface;

    getApiUrl(): string;

    getWSUrl(): string;

    getOptions(): Api.TAdapterOption;

    getBlock(blockHash: string): Promise<Wallet.Entity.Block>;

    getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined>;

    getAddressTxs(address: string): Promise<Wallet.Entity.WalletTransaction[]>;

    getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]>;

    broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;

    getTracker(): Tracker.ITrackerClient;
}

export interface IEthereumNetworkClient extends INetworkClient {
    getGasPrice(): Promise<GasPrice>;

    estimateGas(address: Coin.Key.Address, value: BigNumber): Promise<BigNumber>;
}


export abstract class NetworkClient implements INetworkClient {
    public readonly coin: Coin.CoinInterface;
    public readonly options: Api.TAdapterOption;
    protected onBlocksCbs: plarkcore.NewBlockCallback[] = [];
    protected onAddrTXCbs: Record<string, plarkcore.NewTxCallback[]> = {};

    public constructor(coin: Coin.CoinInterface, options: Api.TAdapterOption) {
        this.coin = coin;
        this.options = options;
    }

    public abstract getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined>;

    public abstract getBlock(blockHash: string): Promise<Wallet.Entity.Block>;

    public abstract getAddressTxs(address: string): Promise<Wallet.Entity.WalletTransaction[]>;

    public abstract broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;

    public getCoin(): Coin.CoinInterface {
        return this.coin;
    }

    public getApiUrl(): string {
        return this.options.url;
    }

    public getWSUrl(): string {
        return this.options.wsUrl as string;
    }

    public enabledWS(): boolean {
        return !!this.getWSUrl();
    }

    public getOptions(): Api.TAdapterOption {
        return this.options;
    }

    /**
     * @todo Must be implement this method for
     */
    public getTracker(): Tracker.ITrackerClient {
        throw new Error('Tracker Client must be implement!');
    }

    public async getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]> {
        const promiseMap = map(addrs, (addr: string) => {
            return this.getAddressTxs(addr);
        });


        const txChunks: Wallet.Entity.WalletTransaction[][] = await Promise.all(promiseMap);

        const txList = [];

        forEach(txChunks, (txs) => {
            forEach(txs, (tx) => {
                const indx = findIndex(txList, { txid: tx.txid } as any);
                if (indx >= 0) {
                    txList[indx] = Object.assign(txList[indx], tx);
                } else {
                    txList.push(tx);
                }
            });
        });

        return txList;
    }

    public destruct() {
        this.onBlocksCbs = [];
        this.onAddrTXCbs = {};
    }
}
