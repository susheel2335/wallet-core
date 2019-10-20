import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import * as Key from '../key';
import { BIPGenericCoin } from '../bip-generic-coin';
import CoinInterface from '../coin-interface';
import { TransactionScheme, SignInputData } from '../entities';
import { TransactionBuilder } from './tx-builder';
import { BIPTransaction } from './bip-transaction';

export abstract class BIPTransactionBuilder implements TransactionBuilder {
    protected readonly coin: BIPGenericCoin;
    protected readonly network: BitcoinJS.Network;

    public constructor(coin: CoinInterface) {
        if (!(coin instanceof BIPGenericCoin)) {
            throw TypeError('Only BIPGenericCoin supported');
        }

        this.coin = coin as BIPGenericCoin;
        this.network = this.coin.networkInfo();
        this.reset();
    }

    public get scheme(): TransactionScheme {
        return TransactionScheme.INPUTS_OUTPUTS;
    }

    public abstract buildSigned(keys: Key.Private[], inputData: SignInputData[]): BIPTransaction;

    public abstract buildUnsigned(): BIPTransaction;

    public abstract reset(): void;

    public abstract addInput(tx: string | BIPTransaction, vout: number, sequence?: number, prevOutScript?: Buffer): void;

    public abstract addOutput(address: Key.Address, value: BigNumber): void;

    public abstract setLockTime(lockTime: number): void;

    public abstract setVersion(version: number): void;

    public static fromBuffer(coin: CoinInterface, txBuffer: Buffer): BIPTransaction {
        return new BIPTransaction(coin, txBuffer);
    }
}
