import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { Utils } from '../../utils';
import * as Constants from '../../constants';
import CoinInterface from '../coin-interface';
import { ScriptType, SignInputData } from '../entities';
import * as Key from '../key';
import { BIPTransaction } from './bip-transaction';
import { BIPTransactionBuilder } from './bip-transaction-builder';

export class BIPCommonTransactionBuilder extends BIPTransactionBuilder {
    protected txBuilder: BitcoinJS.TransactionBuilder;

    public buildSigned(keys: Key.Private[], inputData: SignInputData[]): BIPTransaction {
        if (!inputData) {
            throw new Error('No key metadata');
        }

        let hashType = BitcoinJS.Transaction.SIGHASH_ALL;

        for (let index in keys) {
            const input = this.txBuilder.inputs[index];
            const utxoMeta = inputData[index];

            const keyPair = BitcoinJS.ECPair.fromWIF(keys[index].toString(), this.network);
            const outputType = BitcoinJS.script.classifyOutput(input.prevOutScript) as ScriptType;

            switch (outputType) {
                case ScriptType.PubKeyHash: {
                    this.txBuilder.sign(Number(index), keyPair, undefined, hashType);
                    break;
                }

                case ScriptType.ScriptHash: {
                    const redeemScript = Key.getRedeemScript(keyPair.getPublicKeyBuffer());

                    this.txBuilder.sign(Number(index), keyPair, redeemScript, hashType, utxoMeta.value);
                    break;
                }

                case ScriptType.WitnessPubKeyHash: {
                    this.txBuilder.sign(
                        Number(index),
                        keyPair,
                        undefined,
                        hashType,
                        utxoMeta.value,
                    );

                    break;
                }

                default:
                    throw new Error(`Can not sign '${outputType}' output`);
            }
        }

        return new BIPTransaction(this.coin, this.txBuilder.build());
    }

    public buildUnsigned(): BIPTransaction {
        return new BIPTransaction(this.coin, this.txBuilder.buildIncomplete());
    }

    public reset() {
        this.txBuilder = new BitcoinJS.TransactionBuilder(
            this.network,

            /* @TODO Temporary added until update model of fee calculate */
            new BigNumber(0.00025).times(Constants.SATOSHI_PER_COIN).toNumber(),
        );
    }

    public addInput(tx: string | BIPTransaction, vout: number, sequence?: number, prevOutScript?: Buffer): number {
        if (tx instanceof BIPTransaction) {
            tx = tx.hash.toString('hex');
        }

        return this.txBuilder.addInput(tx, vout, sequence, prevOutScript);
    }

    public addOutput(address: Key.Address, value: BigNumber): number {
        Utils.validateAmountValue(value, this.coin.minValue, false);

        return this.txBuilder.addOutput(
            address.toString({ forceLegacy: true }),
            value.times(Constants.SATOSHI_PER_COIN).toNumber(),
        );
    }

    public setLockTime(locktime: number): void {
        this.txBuilder.setLockTime(locktime);
    }

    public setVersion(version: number): void {
        this.txBuilder.setVersion(version);
    }

    public static fromBuffer(coin: CoinInterface, txBuffer: Buffer): BIPTransaction {
        return new BIPTransaction(coin, txBuffer);
    }
}
