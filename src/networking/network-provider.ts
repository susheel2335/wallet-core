import { forEach } from 'lodash';
import * as Debug from '../debugger';
import * as Coin from '../coin';
import * as Wallet from '../wallet';
import * as Clients from './clients';
import * as Adapter from './adapter';
import { createClient } from './client-helper';

export type ClientUnit = {
    options: plarkcore.AdapterOption;
    client: Clients.INetworkClient;
    banned: boolean;
};

export interface INetworkProvider extends plarkcore.Destructible {
    getCoin(): Coin.CoinInterface;

    getClient(index?: number): Clients.INetworkClient;

    broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;

    getAddressTxs(address: string): Promise<plarkcore.blockchain.CommonTransaction[]>;

    getTx(txid: string): Promise<plarkcore.blockchain.CommonTransaction | undefined>;

    getBulkAddrTxs(address: string[]): Promise<plarkcore.blockchain.CommonTransaction[]>;

    getLastBlock(): Promise<plarkcore.blockchain.CommonBlock>;

    createTracker(index?: number): plarkcore.ITrackerClient;

    fetchFeeRecord(): Promise<plarkcore.FeeRecord>;

    destruct(): void;

    /** @deprecated */
    getTracker(): plarkcore.ITrackerClient;

    /** @deprecated */
    onNewBlock(callback: plarkcore.NewBlockCallback): void;

    /** @deprecated */
    onAddrsTx(address: string[], callback: plarkcore.NewTxCallback): void;

    /** @deprecated */
    onTransactionConfirm(txid: string, callback: plarkcore.NewTxCallback): void;
}


export class NetworkProvider implements INetworkProvider {
    protected clientList: ClientUnit[] = [];
    protected debug: plarkcore.BerryDebug;


    public constructor(protected readonly coin: Coin.CoinInterface) {
        this.debug = Debug.create('NetworkProvider:' + this.coin.getUnit());

        const clientOptions = Adapter.getNetworkAdapters(coin);

        if (clientOptions.length < 1) {
            throw new Error(`No providers for ${coin.getUnit()}`);
        }

        forEach(clientOptions, (props: plarkcore.AdapterOption) => {
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


    public getAddressTxs(address: string): Promise<plarkcore.blockchain.CommonTransaction[]> {
        return this.__callMethod(
            'getAddressTxs',
            [address],
        );
    }


    public getBulkAddrTxs(addrs: string[]): Promise<plarkcore.blockchain.CommonTransaction[]> {
        return this.__callMethod(
            'getBulkAddrsTxs',
            [addrs],
        );
    }


    public getTx(txid: string): Promise<plarkcore.blockchain.CommonTransaction | undefined> {
        return this.__callMethod(
            'getTx',
            [txid],
        );
    }


    public fetchFeeRecord(): Promise<plarkcore.FeeRecord> {
        return this.__callMethod('fetchFeeRecord', []);
    }


    public async getLastBlock(): Promise<plarkcore.blockchain.CommonBlock> {
        throw new Error('Need implement block!');
    }


    public broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        return this.__callMethod<string>('broadCastTransaction', [transaction]);
    }


    /**
     * @param {number}      index
     *
     * @return {plarkcore.ITrackerClient}
     */
    public createTracker(index: number = 0): plarkcore.ITrackerClient {
        if (index in this.clientList) {
            return this.clientList[index].client.createTracker();
        }

        throw new Error(`Client with Index ${index} not found`);
    }


    /** @deprecated */
    public getTracker(): plarkcore.ITrackerClient {
        return this.clientList[0].client.getTracker();
    }


    /** @deprecated */
    public onNewBlock(callback: plarkcore.NewBlockCallback): void {
        this.getTracker().onBlock(callback);
    }


    /** @deprecated */
    public onTransactionConfirm(txid: string, callback: plarkcore.NewTxCallback) {
        this.getTracker().onTransactionConfirm(txid, callback);
    }


    /** @deprecated */
    public onAddrsTx(addrs: string[], callback: plarkcore.NewTxCallback): void {
        this.getTracker().onAddrsTx(addrs, callback);
    }


    public getClient(index: number = 0): Clients.INetworkClient {
        return this.clientList[index].client;
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


    protected catchError = (method: string, client) => {
        return (error: Error) => {
            this.debug(`ERROR in ${method}`, error.message, typeof client, client.getOptions());

            throw error;
        };
    };
}
