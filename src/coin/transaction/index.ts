import { CoinInterface } from '../';
import { BIPGenericCoin } from '../bip-generic-coin';
import { Ethereum } from '../defined';

import { Transaction } from './transaction';
import { BIPTransaction } from './bip-transaction';
import { EthereumTransaction } from './ethereum-transaction';

export { BIPTransactionBuilder } from './bip-transaction-builder';
export { EthereumTransactionBuilder } from './ethereum-transaction-builder';
export { Transaction, BIPTransaction, EthereumTransaction };

export function constructTransaction(coin: CoinInterface, tx: Buffer): Transaction {

    if (coin instanceof BIPGenericCoin) {
        return new BIPTransaction(coin, tx);
    }

    if (coin instanceof Ethereum) {
        return new EthereumTransaction(coin, tx);
    }

    throw Error('Unknown coin type');
}



