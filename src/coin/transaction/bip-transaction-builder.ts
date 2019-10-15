import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';

import { Utils } from 'utils';
import * as Constants from '../../constants';
import * as Coin from '../';
import * as Key from '../key';
import { BIPGenericCoin } from '../bip-generic-coin';
import { TransactionBuilder } from './tx-builder';
import { BIPTransaction } from './bip-transaction';

export class BIPTransactionBuilder implements TransactionBuilder {

    protected txBuilder: BitcoinJS.TransactionBuilder;
    protected readonly coin: BIPGenericCoin;
    protected readonly network: BitcoinJS.Network;

    public constructor(coin: Coin.CoinInterface) {
        if (!(coin instanceof BIPGenericCoin)) {
            throw TypeError('Only BIPGenericCoin supported');
        }

        this.coin = coin as BIPGenericCoin;
        this.network = this.coin.networkInfo();
        this.reset();
    }

    public get scheme(): Coin.TransactionScheme {
        return Coin.TransactionScheme.INPUTS_OUTPUTS;
    }

    protected createTxBuilder(maximumFeeRate: number = 0.00025): BitcoinJS.TransactionBuilder {
        return new BitcoinJS.TransactionBuilder(
            this.network,

            /* @TODO Temporary added until update model of fee calculate */
            new BigNumber(maximumFeeRate).times(Constants.SATOSHI_PER_COIN).toNumber(),
        );
    }

    public buildSigned(keys: Key.Private[], inputData: Coin.SignInputData[]): BIPTransaction {
        if (!inputData) {
            throw new Error('No key metadata');
        }

        for (let index in keys) {
            const input = this.txBuilder.inputs[index];
            const utxoMeta = inputData[index];

            const keyPair = BitcoinJS.ECPair.fromWIF(keys[index].toString(), this.network);
            const outputType = BitcoinJS.script.classifyOutput(input.prevOutScript) as Coin.ScriptType;

            switch (outputType) {
                case Coin.ScriptType.PubKeyHash: {
                    this.txBuilder.sign(Number(index), keyPair);
                    break;
                }

                case Coin.ScriptType.ScriptHash: {
                    const redeemScript = Key.getRedeemScript(keyPair.getPublicKeyBuffer());

                    this.txBuilder.sign(Number(index), keyPair, redeemScript, undefined, utxoMeta.value);
                    break;
                }

                case Coin.ScriptType.WitnessPubKeyHash: {
                    this.txBuilder.sign(
                        Number(index),
                        keyPair,
                        undefined,
                        undefined,
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
        this.txBuilder = this.createTxBuilder();
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

    public static fromBuffer(coin: Coin.CoinInterface, txBuffer: Buffer): BIPTransaction {
        return new BIPTransaction(coin, txBuffer);
    }
}
