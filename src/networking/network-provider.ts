import { forEach } from 'lodash';
import { Coin, Wallet, Debug } from '../';
import * as Networking from './';
import { createClient } from './client-helper';

export type ClientUnit = {
    options: Networking.Api.TAdapterOption;
    client: Networking.Clients.INetworkClient;
    banned: boolean;
};

export interface INetworkProvider extends plarkcore.Destructible {
    getCoin(): Coin.CoinInterface;

    getClient(index?: number): Networking.Clients.INetworkClient;

    broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;

    getAddressTxs(address: string): Promise<Wallet.Entity.WalletTransaction[]>;

    getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined>;

    getBulkAddrTxs(address: string[]): Promise<Wallet.Entity.WalletTransaction[]>;

    getTracker(): plarkcore.ITrackerClient;

    onNewBlock(callback: plarkcore.NewBlockCallback): void;

    onAddrsTx(address: string[], callback: plarkcore.NewTxCallback): void;

    onTransactionConfirm(txid: string, callback: plarkcore.NewTxCallback): void;

    getLastBlock(): Promise<Wallet.Entity.Block>;

    destruct(): void;
}


export class NetworkProvider implements INetworkProvider {
    protected clientList: ClientUnit[] = [];
    protected debug: Debug.BerryDebug;

    public constructor(protected readonly coin: Coin.CoinInterface) {
        this.debug = Debug.create('NetworkProvider:' + this.coin.getUnit());

        const clientOptions = Networking.Adapter.getNetworkAdapters(coin);

        if (clientOptions.length < 1) {
            throw new Error(`No providers for ${coin.getUnit()}`);
        }

        forEach(clientOptions, (props: Networking.Api.TAdapterOption) => {
            const client = createClient(this.coin, props);
            let clientUnit = {
                client: client,
                banned: false,
                options: props.options,
            };

            this.clientList.push(clientUnit);
        });
    }


    public getCoin(): Coin.CoinInterface {
        return this.coin;
    }


    public getAddressTxs(address: string): Promise<Wallet.Entity.WalletTransaction[]> {
        return this.__callMethod(
            'getAddressTxs',
            [address],
        );
    }


    public getBulkAddrTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]> {
        return this.__callMethod(
            'getBulkAddrsTxs',
            [addrs],
        );
    }


    public getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | undefined> {
        return this.__callMethod(
            'getTx',
            [txid],
        );
    }


    protected async __callMethod<T = any>(method: string, params: any[]): Promise<T> {
        const errors = [];
        for (let info of this.clientList) {
            const client = info.client;

            try {
                return await client[method](...params);
            } catch (error) {
                errors.push(info);
            }
        }

        this.catchError(method, errors[0]);
    }


    public broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        return this.__callMethod<string>('broadCastTransaction', [transaction]);
    }


    public getTracker(): plarkcore.ITrackerClient {
        return this.clientList[0].client.getTracker();
    }


    public onNewBlock(callback: plarkcore.NewBlockCallback): void {
        this.getTracker().onBlock(callback);
    }


    public onTransactionConfirm(txid: string, callback: plarkcore.NewTxCallback) {
        this.getTracker().onTransactionConfirm(txid, callback);
    }


    public onAddrsTx(addrs: string[], callback: plarkcore.NewTxCallback): void {
        this.getTracker().onAddrsTx(addrs, callback);
    }


    public getClient(index: number = 0): Networking.Clients.INetworkClient {
        return this.clientList[index].client;
    }


    public async getLastBlock(): Promise<Wallet.Entity.Block> {
        throw new Error('Need implement block!');
    }


    public destruct() {
        for (let i in this.clientList) {
            if (this.clientList[i].client) {
                this.clientList[i].client.destruct();
            }

            delete this.clientList[i];
        }

        this.clientList = [];
    }


    protected catchError = (method: string, client) => {
        return (error: Error) => {
            this.debug(`ERROR in ${method}`, error.message, typeof client, client.getOptions());

            throw error;
        };
    };
}
