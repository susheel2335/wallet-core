import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';

import * as Constants from '../constants';
import * as Coin from './coin';

export abstract class BIPGenericCoin implements Coin.CoinInterface {

    public readonly minValue: BigNumber = new BigNumber(1).div(Constants.SATOSHI_PER_COIN);

    private readonly hdKeyFormat: Coin.Key.FormatInterface;

    protected options: Coin.Options.BIPCoinOptions;

    public constructor(options?: Coin.Options.BIPCoinOptions) {
        if (!options) {
            options = new Coin.Options.BIPCoinOptions();
        }

        this.options = options;

        this.hdKeyFormat = new Coin.Key.BIPKeyFormat(this.networkInfo(), options);
    }

    public getOptions(): Coin.Options.BIPCoinOptions {
        return this.options;
    }

    public getBalanceScheme(): Coin.BalanceScheme {
        return Coin.BalanceScheme.UTXO;
    }

    public getTransactionScheme(): Coin.TransactionScheme {
        return Coin.TransactionScheme.INPUTS_OUTPUTS;
    }

    public isMultiAddressAccount(): boolean {
        return true;
    }

    public isBIPType(): boolean {
        return true;
    }

    public getKeyFormat(): Coin.Key.FormatInterface {
        return this.hdKeyFormat;
    }

    public makePrivateFromSeed(seed: Buffer): Coin.Private.BasicMasterNode {
        return Coin.Private.BasicMasterNode.fromSeedBuffer(seed, this);
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

    public abstract getUnit(): Coin.Unit;

    public abstract getName(): string;

    public abstract getHDCoinType(): number;

    public abstract networkInfo(): BitcoinJS.Network;

    public abstract get defaultFeePerByte(): BigNumber;
}