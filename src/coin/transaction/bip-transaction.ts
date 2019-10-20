import BitcoinJS from 'bitcoinjs-lib';
import { CoinInterface, TransactionScheme } from '../';

import { Transaction } from './transaction';
import { BIPGenericCoin } from '../bip-generic-coin';

export class BIPTransaction implements Transaction {

    private readonly coin: BIPGenericCoin;
    private readonly btcTx: BitcoinJS.Transaction;

    public constructor(coin: CoinInterface, btcTx: BitcoinJS.Transaction | Buffer) {
        if (!(coin instanceof BIPGenericCoin)) {
            throw TypeError('Only BIPGenericCoin supported');
        }

        this.coin = coin as BIPGenericCoin;
        if (btcTx instanceof Buffer) {
            this.btcTx = BitcoinJS.Transaction.fromBuffer(btcTx);
        } else {
            this.btcTx = btcTx;
        }
    }

    public get scheme(): TransactionScheme {
        return TransactionScheme.INPUTS_OUTPUTS;
    }

    public get id(): string {
        return this.btcTx.getId();
    }

    public get hash(): Buffer {
        return this.btcTx.getHash();
    }

    public toBuffer(): Buffer {
        return this.btcTx.toBuffer();
    }

    public get inputs(): BitcoinJS.In[] {
        return this.btcTx.ins;
    }

    public get outputs(): BitcoinJS.Out[] {
        return this.btcTx.outs;
    }

    public get version(): number {
        return this.btcTx.version;
    }

    public get byteLength(): number {
        return this.btcTx.byteLength();
    }

    public get bitcoinJsTransaction(): BitcoinJS.Transaction {
        return this.btcTx;
    }

    public get isSigned(): boolean {
        for (let input of this.inputs) {
            if (input.script.length == 0) {
                //script is empty -> tx is not signed
                return false;
            }
        }
        return true;
    }
}