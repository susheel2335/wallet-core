import { filter } from 'lodash';
import { Entity } from '../../';
import { SimpleProvider } from './simple-provider';

export class TransactionProvider extends SimpleProvider {

    public add(tx: Entity.WalletTransaction): void {
        if (tx.coin !== this.getCoin().getUnit()) {
            throw new Error('Impossible adding transaction!');
        }

        let oldTx = this.get(tx.txid);

        let newTx;
        let emitEvent: string;

        if (oldTx) {
            newTx = Object.assign({}, oldTx, tx);

            if (!oldTx.blockHash && tx.blockHash) {
                emitEvent = 'tx:confirm';
            }
        } else {
            newTx = {
                ...tx,
                receiveTime: new Date().getTime(),
            };
            emitEvent = 'tx:new';
        }

        this.setData({
            txs: {
                ...this.list(),
                [tx.txid]: newTx,
            },
        });

        if (emitEvent) {
            this.emitEvent(emitEvent, newTx);
        }
    }


    public list(): Record<string, Entity.WalletTransaction> {
        return this.getWalletData().txs;
    }


    public unconfirmedList(): Entity.WalletTransaction[] {
        return filter(this.getWalletData().txs, (tx: Entity.WalletTransaction): boolean => !tx.blockHeight);
    }


    public get(txid: string): Entity.WalletTransaction | null {
        return this.list()[txid] || null;
    }
}
