import { CoinInterface } from '../../../coin';
import { Provider, Entity } from '../../../wallet';

export class SimpleProvider {

    protected readonly wdProvider: Provider.WDProvider;

    public constructor(wdProvider: Provider.WDProvider) {
        this.wdProvider = wdProvider;
    }

    protected setData(newState: Partial<Entity.WalletData>) {
        this.wdProvider.setData(newState);
    }

    protected getWalletData(): Entity.WalletData {
        return this.wdProvider.getData();
    }

    protected getCoin(): CoinInterface {
        return this.wdProvider.coin;
    }

    protected emitEvent(event: string, ...args: any[]): boolean {
        return this.wdProvider.emit(event, ...args);
    }
}
