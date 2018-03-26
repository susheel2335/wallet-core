import {each} from 'lodash';
import BigNumber from "bignumber.js";

import {Provider, Generator, Entity, Exceptions} from './';

/**
 * @param {WDBalance} balance
 * @param {boolean} withUnconfirmed
 *
 * @returns {number}
 */
export function calculateBalance(balance: Entity.WDBalance, withUnconfirmed = false): number {
    let totalBalance = new BigNumber(0);

    each(balance.addrBalances, (b: Entity.Balance) => {
        totalBalance = totalBalance.add(b.receive).sub(b.spend);

        if (!withUnconfirmed) {
            totalBalance = totalBalance.sub(b.unconfirmed);
        }
    });

    return totalBalance.toNumber();
}

/**
 * @param {WDBalance} balance
 * @param {string} txid
 *
 * @returns {number}
 *
 * @throws Wallet.Exceptions.BalanceException
 */
export function calculateTxBalance(balance: Entity.WDBalance, txid: string): number {
    const transactionBalance = balance.txBalances[txid];

    if (!transactionBalance) {
        throw new Exceptions.BalanceException(`Transaction with TXID '${txid}' not found`);
    }

    return transactionBalance.receive.sub(transactionBalance.spend).toNumber();
}

/**
 * Create WDProvider by WalletData
 *
 * @param {WalletData} walletData
 * @returns {WDProvider}
 */
export function createWDProvider(walletData: Entity.WalletData): Provider.WDProvider {
    return new Provider.WDProvider(walletData);
}