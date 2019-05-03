import { forEach } from 'lodash';
import { EventEmitter } from 'events';
import { Coin, Networking } from '../../';
import * as Entity from '../entity';

import { Destructible } from '../../utils';
import { BalanceCalculator } from './providers/balance-calculator';
import { AddressProvider } from './providers/address-provider';
import { TransactionProvider } from './providers/transaction-provider';
import { UpdateProvider } from './providers/update-provider';
import { PrivateProvider, createPrivateProvider } from './providers/private-provider';

export type WalletDataListener = (newWd: Entity.WalletData, oldWd: Entity.WalletData) => void;

export class WDProvider extends EventEmitter implements Destructible {
    protected walletData: Entity.WalletData;
    protected eventListeners: WalletDataListener[] = [];
    protected networkProvider: Networking.INetworkProvider;

    public constructor(walletData: Entity.WalletData, networkProvider: Networking.INetworkProvider) {
        super();

        this.walletData = { ...walletData };

        if (!networkProvider) {
            throw new Error(`Need to setup network provider for Coin ${walletData.coin}`);
        }

        if (networkProvider.getCoin().getUnit() !== walletData.coin) {
            throw new Error(`Invalid coin for network provider. Expected ${walletData.coin}`);
        }

        this.networkProvider = networkProvider;
    }


    public static makeEmpty(coin: Coin.CoinInterface, networkProvider?: Networking.INetworkProvider): WDProvider {
        const emptyData = {
            coin: coin.getUnit(),
            addresses: [],
            txs: {},
        };

        return new WDProvider(emptyData, networkProvider);
    }


    public get coin(): Coin.CoinInterface {
        return Coin.makeCoin(this.walletData.coin);
    }


    public get balance(): Entity.WDBalance {
        return new BalanceCalculator(this).calc();
    }


    public get address(): AddressProvider {
        return new AddressProvider(this);
    }


    public get tx(): TransactionProvider {
        return new TransactionProvider(this);
    }


    public getData(): Entity.WalletData {
        return this.walletData;
    }


    public getUpdater(): UpdateProvider {
        return new UpdateProvider(this);
    }


    public setData(newState: Partial<Entity.WalletData>): void {
        const oldWd = { ...this.walletData };
        this.walletData = Object.assign({}, oldWd, newState);

        forEach(this.eventListeners, (el) => {
            el(this.walletData, oldWd);
        });
    }


    public onChange(eventListener: WalletDataListener): void {
        this.eventListeners.push(eventListener);
    }


    public getNetworkProvider(): Networking.INetworkProvider {
        return this.networkProvider;
    }


    public getPrivate(seed: Buffer): PrivateProvider {
        return createPrivateProvider(seed, this);
    }


    public destruct() {
        this.eventListeners = [];
    }
}
