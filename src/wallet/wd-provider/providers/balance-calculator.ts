import { find, forEach } from 'lodash';
import BigNumber from 'bignumber.js';

import Constants from '../../../constants';
import * as Coin from '../../../coin';
import * as Wallet from '../../';

export interface InputUnit {
    txid: string;
    prevTxid: string;
    prevOutIndex: number;
}

export class BalanceCalculator {

    private readonly coin: Coin.CoinInterface;
    private readonly wdProvider: Wallet.Provider.WDProvider;

    public constructor(wdProvider: Wallet.Provider.WDProvider) {
        this.wdProvider = wdProvider;
        this.coin = this.wdProvider.coin;
    }

    public calc(): Wallet.Entity.WDBalance {
        switch (this.coin.getBalanceScheme()) {
            case Coin.BalanceScheme.UTXO: {
                return this.calcUTXOBalance();
            }

            case Coin.BalanceScheme.ADDRESS_BALANCE: {
                return this.calcEtherBalance();
            }
        }

        throw new Error('Not implement balance scheme');
    }


    protected generateEmptyBalance(): Wallet.Entity.WDBalance {
        const balance: Wallet.Entity.WDBalance = {
            addrBalances: {},
            txBalances: {},
            utxo: [],
        };

        const { addresses, txs } = this.wdProvider.getData();

        forEach(addresses, (addr: Wallet.Entity.WalletAddress) => {
            balance.addrBalances[addr.address] = {
                receive: new BigNumber(0),
                spend: new BigNumber(0),
                unconfirmed: new BigNumber(0),
            };
        });

        forEach(txs, (tx: Wallet.Entity.WalletTransaction) => {
            balance.txBalances[tx.txid] = {
                receive: new BigNumber(0),
                spend: new BigNumber(0),
            };
        });

        return balance;
    }

    protected calcUTXOBalance(): Wallet.Entity.WDBalance {
        const wdBalance = this.generateEmptyBalance();

        const { txs = {} } = this.wdProvider.getData();
        const inputMap = generateInputMap(txs);

        forEach(txs, (tx: Wallet.Entity.BIPTransaction) => {
            let txBalance = wdBalance.txBalances[tx.txid];

            forEach(tx.outputs, (out: Wallet.Entity.BIPOutput, index: number) => {
                const outAddress = out.addresses[0];
                // @TODO Need review and change model of calculate addresses data
                if (!(outAddress in wdBalance.addrBalances)) {
                    return;
                }

                let wdAddressBalance = wdBalance.addrBalances[outAddress];

                wdAddressBalance.receive = wdAddressBalance.receive.plus(out.value);
                if (!tx.blockHeight) {
                    wdAddressBalance.unconfirmed = wdAddressBalance.unconfirmed.plus(out.value);
                }

                txBalance.receive = txBalance.receive.plus(out.value);

                const spendableInput = find(inputMap, { prevTxid: tx.txid, prevOutIndex: index });
                if (spendableInput) {
                    wdAddressBalance.spend = wdAddressBalance.spend.plus(out.value);

                    let spendTxBalance = wdBalance.txBalances[spendableInput.txid];
                    spendTxBalance.spend = spendTxBalance.spend.plus(out.value);
                } else {
                    wdBalance.utxo.push({
                        txid: tx.txid,
                        vout: index,
                        value: new BigNumber(out.value).times(Constants.SATOSHI_PER_COIN).toNumber(),
                        addresses: out.addresses,
                        prevScript: out.scriptPubKey,
                        prevScriptType: out.scriptType,
                        confirmed: tx.blockHeight && tx.blockHeight > 0,

                        /* @deprecated */
                        script: { length: 120 },
                    });
                }
            });
        });

        return wdBalance;
    }


    protected calcEtherBalance(): Wallet.Entity.WDBalance {
        const wdBalance = this.generateEmptyBalance();

        const { txs = {} } = this.wdProvider.getData();

        forEach(txs, (tx: Wallet.Entity.EtherTransaction) => {
            let txBalance = wdBalance.txBalances[tx.txid];

            const txGas = new BigNumber(tx.gasUsed ? tx.gasUsed : tx.gasLimit).times(tx.gasPrice);

            const confirmed = Boolean(tx.blockHeight);

            let toAddr = wdBalance.addrBalances[tx.to];
            let fromAddr = wdBalance.addrBalances[tx.from];

            if (toAddr) {
                if (tx.receiptStatus) {
                    txBalance.receive = txBalance.receive.plus(tx.value);
                    toAddr.receive = toAddr.receive.plus(tx.value);
                }

                if (!confirmed) {
                    toAddr.unconfirmed = toAddr.unconfirmed.plus(tx.value);
                }
            }

            if (fromAddr) {
                fromAddr.spend = fromAddr.spend.plus(txGas);
                txBalance.spend = txBalance.spend.plus(txGas);

                if (confirmed) {
                    if (tx.receiptStatus) {
                        fromAddr.spend = fromAddr.spend.plus(tx.value);
                        txBalance.spend = txBalance.spend.plus(tx.value);
                    }
                } else {
                    fromAddr.spend = fromAddr.spend.plus(tx.value);
                    txBalance.spend = txBalance.spend.plus(tx.value);
                }
            }
        });

        return wdBalance;
    }
}


function generateInputMap(txs: Record<string, Wallet.Entity.WalletTransaction>): InputUnit[] {
    const inputMap: InputUnit[] = [];

    forEach(txs, (tx: Wallet.Entity.BIPTransaction) => {
        tx.inputs.map((input: Wallet.Entity.BIPInput) => {
            inputMap.push({
                txid: tx.txid,
                prevTxid: input.prevTxid,
                prevOutIndex: input.prevOutIndex,
            } as InputUnit);
        });
    });

    return inputMap;
}
