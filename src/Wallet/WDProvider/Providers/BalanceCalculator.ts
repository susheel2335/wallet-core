import {find, each, reduce, map} from 'lodash';
import BigNumber from "bignumber.js";

import * as Coin from '../../../Coin';
import * as Wallet from '../../';


export interface InputElement {
    txid: string;
    prevTxid: string;
    prevOutIndex: number;
}

export class BalanceCalculator {

    private readonly coin: Coin.CoinInterface;

    /**
     * @param {WDProvider} wdProvider
     */
    constructor(private readonly wdProvider: Wallet.Provider.WDProvider) {
        this.coin = this.wdProvider.coin;
    }

    /**
     * @returns {InputElement[]}
     */
    generateInputMap = (): InputElement[] => {
        const {txs = {}} = this.wdProvider.getData();

        return reduce(txs, (list: any[], tx: Wallet.Entity.BIPTransaction) => {
            return [
                ...list,
                ...map(tx.inputs, (input: Wallet.Entity.BIPInput) => {
                    return {
                        txid: tx.txid,
                        prevTxid: input.prevTxid,
                        prevOutIndex: input.prevOutIndex
                    }
                })
            ];
        }, []);
    };

    /**
     * @param {WDBalance} wdBalance
     * @returns {WDBalance}
     */
    protected calcUTXOBalance(wdBalance: Wallet.Entity.WDBalance): Wallet.Entity.WDBalance {
        const {txs = {}} = this.wdProvider.getData();
        const inputMap = this.generateInputMap();

        each(txs, (tx: Wallet.Entity.BIPTransaction) => {
            each(tx.outputs, (out: Wallet.Entity.BIPOutput, index: number) => {
                // @TODO Need review and change model of calculate addresses data
                if (!(out.addresses[0] in wdBalance.addrBalances)) {
                    return;
                }

                let txBalance = wdBalance.txBalances[tx.txid];
                let wdAddressBalance = wdBalance.addrBalances[out.addresses[0]];

                wdAddressBalance.receive = wdAddressBalance.receive.add(out.value);
                if (null === tx.blockHeight) {
                    wdAddressBalance.unconfirmed = wdAddressBalance.unconfirmed.add(out.value);
                }

                txBalance.receive = txBalance.receive.add(out.value);

                const spendableInput = find(inputMap, {prevTxid: tx.txid, prevOutIndex: index});
                if (spendableInput) {
                    wdAddressBalance.spend = wdAddressBalance.spend.add(out.value);

                    let spendTxBalance = wdBalance.txBalances[spendableInput.txid];
                    spendTxBalance.spend = spendTxBalance.spend.add(out.value);
                } else {
                    wdBalance.utxo.push({
                        txid: tx.txid,
                        index: index,
                        value: new BigNumber(out.value),
                        addresses: out.addresses,
                        confirmed: null !== tx.blockHeight
                    });
                }
            });
        });

        return wdBalance;
    }

    /**
     * @param {WDBalance} wdBalance
     * @returns {WDBalance}
     */
    protected calcAddressBalance(wdBalance: Wallet.Entity.WDBalance): Wallet.Entity.WDBalance {
        const {txs = {}} = this.wdProvider.getData();

        each(txs, (tx: Wallet.Entity.EtherTransaction) => {
            let txBalance = wdBalance.txBalances[tx.txid];

            const txGas = new BigNumber(tx.gasUsed ? tx.gasUsed : tx.gasLimit).mul(tx.gasPrice);

            const confirmed = !!tx.blockHeight;

            let toAddr = wdBalance.addrBalances[tx.to];
            let fromAddr = wdBalance.addrBalances[tx.from];

            if (toAddr) {
                if (tx.receiptStatus) {
                    txBalance.receive = txBalance.receive.add(tx.value);
                    toAddr.receive = toAddr.receive.add(tx.value);
                }

                if (!confirmed) {
                    toAddr.unconfirmed = toAddr.unconfirmed.add(tx.value);
                }
            }

            if (fromAddr) {
                fromAddr.spend = fromAddr.spend.add(txGas);
                txBalance.spend = txBalance.spend.add(txGas);

                if (confirmed) {
                    if (tx.receiptStatus) {
                        fromAddr.spend = fromAddr.spend.add(tx.value);
                        txBalance.spend = txBalance.spend.add(tx.value);
                    }
                } else {
                    fromAddr.spend = fromAddr.spend.add(tx.value);
                    txBalance.spend = txBalance.spend.add(tx.value);
                }
            }
        });

        return wdBalance;
    }

    /**
     * @returns {WDBalance}
     */
    calc(): Wallet.Entity.WDBalance {
        const balance: Wallet.Entity.WDBalance = {
            addrBalances: {},
            txBalances: {},
            utxo: []
        };

        const {addresses, txs} = this.wdProvider.getData();

        each(addresses, (addr: Wallet.Entity.WalletAddress) => {
            const normalizedAddress = this.coin.getKeyFormat().parseAddress(addr.address).toString();
            balance.addrBalances[normalizedAddress] = {
                receive: new BigNumber(0),
                spend: new BigNumber(0),
                unconfirmed: new BigNumber(0)
            };
        });

        each(txs, (tx: Wallet.Entity.WalletTransaction) => {
            balance.txBalances[tx.txid] = {
                receive: new BigNumber(0),
                spend: new BigNumber(0)
            };
        });

        switch (this.coin.getBalanceScheme()) {
            case Coin.BalanceScheme.UTXO: {
                return this.calcUTXOBalance(balance);
            }

            case Coin.BalanceScheme.ADDRESS_BALANCE: {
                return this.calcAddressBalance(balance);
            }
        }

        throw new Error('Not implement balance scheme');
    }
}