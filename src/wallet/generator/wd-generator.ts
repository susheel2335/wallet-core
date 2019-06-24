import { forEach, get } from 'lodash';
import * as Coin from '../../coin';
import * as Networking  from '../../networking';
import * as Provider from '../wd-provider';
import * as Entity from '../entity';

export interface WDGeneratorInterface {
    fill(): Promise<Provider.WDProvider>;
}

export abstract class WDGenerator implements WDGeneratorInterface {
    protected readonly coin: Coin.CoinInterface;
    protected readonly seed: Buffer;
    protected readonly wdProvider: Provider.WDProvider;

    public constructor(
        coin: Coin.CoinInterface,
        seed: Buffer,
        networkProvider: Networking.INetworkProvider,
        options: any = {},
    ) {
        this.coin = coin;
        this.seed = seed;

        const accountIndex = get(options, 'accountIndex', 0);

        this.wdProvider = Provider.WDProvider.makeEmpty(this.coin, networkProvider, accountIndex);
    }

    protected fillAddrsTxs(txs: Entity.WalletTransaction[]) {
        forEach(txs, (tx: Entity.WalletTransaction) => this.wdProvider.tx.add(tx));
    };

    public abstract fill(): Promise<Provider.WDProvider>;
}
