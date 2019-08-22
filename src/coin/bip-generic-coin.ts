import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import * as Key from './key';
import * as Options from './options';
import * as Private from './private';
import * as Constants from '../constants';
import { BalanceScheme, TransactionScheme, Unit } from './entities';
import CoinInterface from './coin-interface';


export abstract class BIPGenericCoin implements CoinInterface {

    public readonly minValue: BigNumber = new BigNumber(1).div(Constants.SATOSHI_PER_COIN);

    private readonly hdKeyFormat: Key.FormatInterface;

    protected options: Options.BIPCoinOptions;

    public constructor(options?: Options.BIPCoinOptions) {
        if (!options) {
            options = new Options.BIPCoinOptions();
        }

        this.options = options;

        this.hdKeyFormat = new Key.BIPKeyFormat(this.networkInfo(), options);
    }

    public getOptions(): Options.BIPCoinOptions {
        return this.options;
    }

    public getBalanceScheme(): BalanceScheme {
        return BalanceScheme.UTXO;
    }

    public getTransactionScheme(): TransactionScheme {
        return TransactionScheme.INPUTS_OUTPUTS;
    }

    public isMultiAddressAccount(): boolean {
        return true;
    }

    public isBIPType(): boolean {
        return true;
    }

    public getKeyFormat(): Key.FormatInterface {
        return this.hdKeyFormat;
    }

    public makePrivateFromSeed(seed: Buffer): Private.BasicMasterNode {
        return Private.BasicMasterNode.fromSeedBuffer(seed, this);
    }

    public get lowFeePerByte(): BigNumber {
        return this.defaultFeePerByte.div(2);
    }

    public get highFeePerByte(): BigNumber {
        return this.defaultFeePerByte.times(4);
    }

    public get minFeePerByte(): BigNumber {
        return new BigNumber(1).div(Constants.SATOSHI_PER_COIN);
    }

    public isSegWitAvailable(): boolean {
        return this.networkInfo().bech32 !== undefined;
    }

    public abstract getUnit(): Unit;

    public abstract getName(): string;

    public abstract getHDCoinType(): number;

    public abstract networkInfo(): BitcoinJS.Network;

    public abstract get defaultFeePerByte(): BigNumber;
}