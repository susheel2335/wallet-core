import BigNumber from 'bignumber.js';
import { forEach, map, findIndex } from 'lodash';
import * as Coin from '../../coin';
import * as Wallet from '../../wallet';
import * as Tracker from './tracker';

export { Tracker };

export interface INetworkClient extends plarkcore.Destructible {
    getCoin(): Coin.CoinInterface;

    getApiUrl(): string;

    getWSUrl(): string;

    getOptions(): plarkcore.AdapterOption;

    getInfo(): Promise<plarkcore.BlockchainInfo>;

    getBlock(blockHash: string): Promise<Wallet.Entity.Block>;

    getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined>;

    getAddressTxs(address: string): Promise<Wallet.Entity.WalletTransaction[]>;

    getBulkAddrsTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]>;

    broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;

    getTracker(): plarkcore.ITrackerClient;
}

export interface IEthereumNetworkClient extends INetworkClient {
    getGasPrice(): Promise<plarkcore.GasPrice>;

    estimateGas(option: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber>;
}


export abstract class NetworkClient implements INetworkClient {
    public readonly coin: Coin.CoinInterface;
    public readonly options: plarkcore.AdapterOption;
    protected onBlocksCbs: plarkcore.NewBlockCallback[] = [];
    protected onAddrTXCbs: Record<string, plarkcore.NewTxCallback[]> = {};

    /**
     * @param {CoinInterface}   coin
     * @param {plarkcore.AdapterOption}  options
     */
    public constructor(coin: Coin.CoinInterface, options: plarkcore.AdapterOption) {
        this.coin = coin;
        this.options = options;
    }

    public abstract getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined>;

    public abstract getInfo(): Promise<plarkcore.BlockchainInfo>;

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

    public getOptions(): plarkcore.AdapterOption {
        return this.options;
    }

    /**
     * @todo Must be implement this method for
     */
    public getTracker(): plarkcore.ITrackerClient {
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
