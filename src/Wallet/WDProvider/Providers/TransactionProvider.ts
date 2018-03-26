import {Dictionary, filter} from 'lodash';
import {Entity} from "../../";
import SimpleProvider from './SimpleProvider';

export default class TransactionProvider extends SimpleProvider {
    /**
     * @param {WalletTransaction} tx
     */
    add(tx: Entity.WalletTransaction): void {
        if (tx.coin !== this.getCoin().getUnit()) {
            throw new Error("Impossible adding transaction!");
        }

        let newTx, oldTx = this.get(tx.txid);

        if (oldTx) {
            newTx = Object.assign({}, oldTx, tx);
        } else {
            newTx = {
                ...tx,
                receiveTime: new Date().getTime()
            }
        }

        this.setData({
            txs: {
                ...this.list(),
                [tx.txid]: newTx
            }
        });
    }

    /**
     * Get List of transactions
     *
     * @returns {Dictionary<WalletTransaction>}
     */
    list(): Dictionary<Entity.WalletTransaction> {
        return this.getWalletData().txs;
    }

    /**
     * @returns {WalletTransaction[]}
     */
    unconfirmedList(): Entity.WalletTransaction[] {
        return filter(this.getWalletData().txs, (tx: Entity.WalletTransaction): boolean => !tx.blockHeight);
    }

    /**
     * @param {string} txid
     *
     * @returns {WalletTransaction | null}
     */
    get(txid: string): Entity.WalletTransaction | null {
        return this.list()[txid] || null;
    }
}
