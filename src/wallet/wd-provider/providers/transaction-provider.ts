import { filter } from 'lodash';
import { SimpleProvider } from './simple-provider';
import bc = plarkcore.blockchain;

export class TransactionProvider extends SimpleProvider {
    public add(tx: bc.CommonTransaction): void {
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


    public list(): Record<string, bc.CommonTransaction> {
        return this.getWalletData().txs;
    }


    public unconfirmedList(): bc.CommonTransaction[] {
        return filter(this.getWalletData().txs, (tx: bc.CommonTransaction): boolean => !tx.blockHeight);
    }


    public get(txid: string): bc.CommonTransaction | undefined {
        return this.list()[txid] || undefined;
    }
}
