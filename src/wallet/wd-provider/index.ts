import { forEach } from 'lodash';
import { EventEmitter } from 'events';
import { Coin, Networking } from '../../';
import * as Entity from '../entity';

import { Destructable } from '../../utils';
import { BalanceCalculator } from './providers/balance-calculator';
import { AddressProvider } from './providers/address-provider';
import { TransactionProvider } from './providers/transaction-provider';
import { UpdateProvider } from './providers/update-provider';
import { PrivateProvider, createPrivateProvider } from './providers/private-provider';

export type WalletDataListener = (newWd: Entity.WalletData, oldWd: Entity.WalletData) => void;

export class WDProvider extends EventEmitter implements Destructable {
    protected walletData: Entity.WalletData;
    protected eventListeners: WalletDataListener[] = [];
    protected networkProvider: Networking.NetworkProvider;

    public constructor(walletData: Entity.WalletData) {
        super();

        this.walletData = { ...walletData };
    }

    public static makeEmpty(coin: Coin.CoinInterface): WDProvider {
        return new WDProvider({
            coin: coin.getUnit(),
            addresses: [],
            txs: {},
        });
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

    public getNetworkProvider(): Networking.NetworkProvider {
        if (!this.networkProvider) {
            this.networkProvider = new Networking.NetworkProvider(this.coin);
        }

        return this.networkProvider;
    }

    public getPrivate(seed: Buffer): PrivateProvider {
        return createPrivateProvider(seed, this);
    }

    public destruct() {
        this.eventListeners = [];

        if (this.networkProvider) {
            this.networkProvider.destruct();
            delete this.networkProvider;
        }
    }
}
