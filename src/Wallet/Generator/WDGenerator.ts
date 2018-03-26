const queue = require('queue');
import {each} from 'lodash';

import * as HD from '../../HD';
import * as Coin from '../../Coin';
import * as Wallet from '../../Wallet';
import * as Constants from '../../Constants';

export class WDGenerator {

    protected readonly coin: Coin.CoinInterface;
    protected readonly seed: Buffer;

    constructor(coin: Coin.CoinInterface, seed: Buffer) {
        this.coin = coin;
        this.seed = seed;
    }

    /**
     * @param queue
     * @param {WDProvider} wdProvider
     * @param {AddressType} addressType
     */
    scanAddresses(queue, wdProvider: Wallet.Provider.WDProvider, addressType: HD.BIP44.AddressType): void {

        const networkProvider = wdProvider.getNetworkProvider();
        const privateProvider = wdProvider.getPrivate(this.seed);

        const requestData = (done) => {
            const addr = privateProvider.deriveNew(addressType);

            const resolveAddressTransactions = (txs: Wallet.Entity.WalletTransaction[]) => {
                each(txs, (tx: Wallet.Entity.WalletTransaction) => wdProvider.tx.add(tx));

                if (this.coin.isMultiAddressAccount()) {
                    const pureAddrCount = wdProvider.address.pureAddrCount(addressType);
                    if (pureAddrCount < Constants.MIN_ADDRESS_COUNT) {
                        this.scanAddresses(queue, wdProvider, addressType);
                    }
                }

                done();
            };

            networkProvider.getAddressTxs(addr.address).then(resolveAddressTransactions);
        };

        queue.push(requestData);
    }

    /**
     * @returns {Promise<WDProvider>}
     */
    generate(): Promise<Wallet.Provider.WDProvider> {
        const wdProvider: Wallet.Provider.WDProvider = Wallet.Provider.WDProvider.makeEmpty(this.coin);

        return new Promise<Wallet.Provider.WDProvider>((resolve, reject) => {
            const generatorQueue = queue();

            this.scanAddresses(generatorQueue, wdProvider, HD.BIP44.AddressType.RECEIVE);
            if (this.coin.isMultiAddressAccount()) {
                this.scanAddresses(generatorQueue, wdProvider, HD.BIP44.AddressType.CHANGE);
            }

            generatorQueue.start((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(wdProvider);
            });
        });
    }
}
