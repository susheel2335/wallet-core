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

        this.hdKeyFormat = this.buildHDKeyFormat();
    }

    protected buildHDKeyFormat(): Key.BIPKeyFormat {
        return new Key.BIPKeyFormat(this.networkInfo(), this.options);
    }

    public getOptions(): Options.BIPCoinOptions {
        return this.options;
    }

    public getScheme(): string {
        return this.getName()
                   .replace(/\S/g, '')
                   .toLowerCase();
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

    public get lowFeePerKB(): BigNumber {
        return this.defaultFeePerKB.div(2);
    }

    public get highFeePerKB(): BigNumber {
        return this.defaultFeePerKB.times(4);
    }

    public get minFeePerKB(): BigNumber {
        return new BigNumber(1).div(Constants.SATOSHI_PER_COIN);
    }

    public isSegWitAvailable(): boolean {
        return this.networkInfo().bech32 !== undefined;
    }

    public toOutputScript(address: string | Key.Address): Buffer {
        if (address instanceof Key.Address) {
            address = address.toString();
        }

        return BitcoinJS.address.toOutputScript(address, this.networkInfo());
    }

    public fromOutputScript(data: Buffer): string {
        return BitcoinJS.address.fromOutputScript(data, this.networkInfo());
    }

    public getNVersion(): number {
        return 1;
    }

    public abstract getUnit(): Unit;

    public abstract getName(): string;

    public abstract getHDCoinType(): number;

    public abstract networkInfo(): BitcoinJS.Network;

    public abstract get defaultFeePerKB(): BigNumber;
}