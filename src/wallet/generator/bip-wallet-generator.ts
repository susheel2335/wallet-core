import { times } from 'lodash';
import Bottleneck from 'bottleneck';
import HD from '../../hd';
import * as Constants from '../../constants';
import * as Networking from '../../networking';
import * as Coin from '../../coin';
import * as Wallet from '../../wallet';

import { WDGenerator } from './wd-generator';

export class BIPWalletGenerator extends WDGenerator {
    protected readonly limiter: Bottleneck;

    public constructor(coin: Coin.CoinInterface, seed: Buffer, networkProvider: Networking.INetworkProvider, option: any = {}) {
        super(coin, seed, networkProvider, option);

        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: option.addressTime || 100,
        });
    }


    public deriveAddresses(addressCount: number,
                           addressType: HD.BIP44.AddressType): Promise<string[]> {

        const privateProvider = this.wdProvider.getPrivate(this.seed);
        const addrsPromises: Promise<string>[] = [];

        times(addressCount, () => {
            addrsPromises.push(
                this.limiter.schedule(
                    async () => privateProvider.deriveNew(addressType).address,
                ),
            );
        });

        return Promise.all(addrsPromises);
    }


    public async extractAddrsTxs(addrs: string[]): Promise<Wallet.Entity.WalletTransaction[]> {
        const networkProvider = this.wdProvider.getNetworkProvider();

        return networkProvider.getBulkAddrTxs(addrs);
    }


    public async bulkAddrGenerate(addressType: HD.BIP44.AddressType): Promise<void> {
        const addrs: string[] = await this.deriveAddresses(Constants.MIN_ADDRESS_COUNT, addressType);

        const txs: Wallet.Entity.WalletTransaction[] = await this.extractAddrsTxs(addrs);
        this.fillAddrsTxs(txs);

        const pureAddrCount = this.wdProvider.address.pureAddrCount(addressType);
        if (pureAddrCount < Constants.MIN_ADDRESS_COUNT) {
            await this.bulkAddrGenerate(addressType);
        }
    }


    public async fill(): Promise<Wallet.Provider.WDProvider> {
        await this.bulkAddrGenerate(HD.BIP44.AddressType.RECEIVE);
        await this.bulkAddrGenerate(HD.BIP44.AddressType.CHANGE);

        return this.wdProvider;
    }
}
