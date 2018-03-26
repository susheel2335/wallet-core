import * as BitcoinJS from "bitcoinjs-lib";
import {CoinInterface, TransactionScheme} from "../";

import {Transaction} from './Transaction';
import {BIPGenericCoin} from "../BIPGenericCoin";

export class BIPTransaction implements Transaction {

    private readonly coin: BIPGenericCoin;
    private readonly btcTx: BitcoinJS.Transaction;

    constructor(coin: CoinInterface, btcTx: BitcoinJS.Transaction | Buffer) {
        if (!(coin instanceof BIPGenericCoin)) {
            throw TypeError("Only BIPGenericCoin supported");
        }

        this.coin = coin as BIPGenericCoin;
        if (btcTx instanceof Buffer) {
            this.btcTx = BitcoinJS.Transaction.fromBuffer(btcTx);
        } else {
            this.btcTx = btcTx;
        }
    }

    get scheme(): TransactionScheme {
        return TransactionScheme.INPUTS_OUTPUTS;
    }

    get id(): string {
        return this.btcTx.getId()
    }

    get hash(): Buffer {
        return this.btcTx.getHash()
    }

    toBuffer(): Buffer {
        return this.btcTx.toBuffer()
    }

    get inputs(): BitcoinJS.In[] {
        return this.btcTx.ins;
    }

    get outputs(): BitcoinJS.Out[] {
        return this.btcTx.outs;
    }

    get version(): number {
        return this.btcTx.version;
    }

    get byteLength(): number {
        return this.btcTx.byteLength();
    }

    get bitcoinJsTransaction(): BitcoinJS.Transaction {
        return this.btcTx;
    }

    get isSigned(): boolean {
        for (let input of this.inputs) {
            if (input.script.length == 0) {
                //script is empty -> tx is not signed
                return false;
            }
        }
        return true;
    }
}