import CoinInterface from '../coin-interface';
import { BIPGenericCoin } from '../bip-generic-coin';
import { Ethereum } from '../defined';

import { Transaction } from './transaction';
import { BIPTransaction } from './bip-transaction';
import { EthereumTransaction } from './ethereum-transaction';
import { BIPTransactionBuilder } from './bip-transaction-builder';
import { BIPCommonTransactionBuilder } from './bip-common-transaction-builder';
import { BCHTransactionBuilder } from './bch-transaction-builder';

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


export function createTransactionBuilder(coin: CoinInterface): BIPTransactionBuilder {
    const coinUnit = coin.getUnit();
    if (coinUnit === 'BCH' || coinUnit === 'BCHt') {
        return new BCHTransactionBuilder(coin);
    }

    return new BIPCommonTransactionBuilder(coin);
}