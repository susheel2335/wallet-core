import HD from '../../hd';
import * as Wallet from '../';
import { WDGenerator } from './wd-generator';

export class EthereumWalletGenerator extends WDGenerator {
    public async fill(): Promise<Wallet.Provider.WDProvider> {

        const networkProvider = this.wdProvider.getNetworkProvider();
        const privateProvider = this.wdProvider.getPrivate(this.seed);

        // @TODO Hardcoded for Ethereum wallet types
        const addr = privateProvider.deriveNew(HD.BIP44.AddressType.RECEIVE);

        const txs: Wallet.Entity.WalletTransaction[] = await networkProvider.getAddressTxs(addr.address);

        this.fillAddrsTxs(txs);

        return this.wdProvider;
    }
}
