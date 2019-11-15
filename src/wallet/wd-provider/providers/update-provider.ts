import queue from 'queue';
import { map, forEach, chunk } from 'lodash';
import * as Wallet from '../../../wallet';
import { create } from '../../../debugger';
import { WDProvider } from '../../wd-provider';
import { SimpleProvider } from './simple-provider';

export class UpdateProvider extends SimpleProvider {

    protected debug: any;

    public constructor(wdProvider: WDProvider) {
        super(wdProvider);

        this.debug = create(`${this.getCoin().getUnit()}_UPDATER`);
    }

    protected async updateTransactions(addrs: Wallet.Entity.WalletAddress[]): Promise<void> {
        const networkProvider = this.wdProvider.getNetworkProvider();
        const rawAddrs = map(addrs, (addr) => addr.address);

        const txs: plarkcore.blockchain.CommonTransaction[] = await networkProvider.getBulkAddrTxs(rawAddrs);

        forEach(txs, (tx: plarkcore.blockchain.CommonTransaction) => {
            this.wdProvider.tx.add(tx);
        });
    }

    public update(): Promise<WDProvider> {
        const mapChunkIterator = (addrs: Wallet.Entity.WalletAddress[]) => {
            return async (done) => {
                try {
                    await this.updateTransactions(addrs);
                } catch (error) {
                    this.debug(error.message);
                } finally {
                    done();
                }
            };
        };

        const requestList = map(
            chunk(this.wdProvider.address.list(), 10),
            mapChunkIterator,
        );

        const updaterQueue = queue();

        updaterQueue.push(...requestList);

        const promiseResolver = (resolve) => {
            updaterQueue.start((err) => {
                if (err) throw err;

                resolve(this.wdProvider);
            });
        };

        return new Promise(promiseResolver);
    }
}
