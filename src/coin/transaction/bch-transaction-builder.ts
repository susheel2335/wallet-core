import BigNumber from 'bignumber.js';
import { BITBOX, TransactionBuilder } from '@plark/bitbox-sdk';
import { Utils } from '../../utils';
import * as Constants from '../../constants';
import CoinInterface from '../coin-interface';
import { ScriptType, SignInputData } from '../entities';
import * as Key from '../key';
import { BIPTransactionBuilder } from './bip-transaction-builder';
import { BIPTransaction } from './bip-transaction';

export class BCHTransactionBuilder extends BIPTransactionBuilder {
    protected txBuilder: TransactionBuilder;

    /**
     * I understand that this function if a bicycle..
     */
    public buildSigned(keys: Key.Private[], inputData: SignInputData[]): BIPTransaction {
        if (!inputData) {
            throw new Error('No key metadata');
        }

        let bitbox = new BITBOX();

        for (let index in keys) {
            const input = this.txBuilder.transaction.inputs[index];
            const utxoMeta = inputData[index];

            const keyPair = bitbox.ECPair.fromWIF(keys[index].toString());
            const hashType = this.txBuilder.hashTypes.SIGHASH_ALL;
            const signAlgorithm = this.txBuilder.signatureAlgorithms.SCHNORR;

            const outputType = bitbox.Script.classifyOutput(input.prevOutScript) as ScriptType;

            const redeemScript = outputType === ScriptType.ScriptHash
                ? Key.getRedeemScript(keyPair.getPublicKeyBuffer())
                : undefined;

            this.txBuilder.sign(
                Number(index),
                keyPair,
                redeemScript,
                hashType,
                utxoMeta.value,
                signAlgorithm,
            );
        }

        return new BIPTransaction(this.coin, this.txBuilder.build());
    }

    public buildUnsigned(): BIPTransaction {
        // @ts-ignore
        return new BIPTransaction(this.coin, this.txBuilder.buildIncomplete());
    }

    public reset() {
        let bitbox = new BITBOX();

        this.txBuilder = new bitbox.TransactionBuilder(
            'mainnet',
            new BigNumber(0.00025).times(Constants.SATOSHI_PER_COIN).toNumber(),
        );
    }

    public addInput(tx: string | BIPTransaction, vout: number, sequence?: number, prevOutScript?: Buffer): void {
        if (tx instanceof BIPTransaction) {
            tx = tx.hash.toString('hex');
        }

        this.txBuilder.addInput(tx, vout, sequence, prevOutScript);
    }

    public addOutput(address: Key.Address, value: BigNumber): void {
        Utils.validateAmountValue(value, this.coin.minValue, false);

        this.txBuilder.addOutput(
            address.toString(),
            value.times(Constants.SATOSHI_PER_COIN).toNumber(),
        );
    }

    public setLockTime(locktime: number): void {
        this.txBuilder.setLockTime(locktime);
    }

    public setVersion(version: number): void {
        // this.txBuilder.transaction.setVersion(version);
    }

    public static fromBuffer(coin: CoinInterface, txBuffer: Buffer): BIPTransaction {
        return new BIPTransaction(coin, txBuffer);
    }
}
