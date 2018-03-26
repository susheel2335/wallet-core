import * as Coin from "./";
import {Network} from "bitcoinjs-lib";
import * as Constants from "../Constants"
import BigNumber from "bignumber.js";
import {BIPTransaction} from "./Transaction";

export abstract class BIPGenericCoin implements Coin.CoinInterface {

    getOptions(): Coin.Options.BIPCoinOptions {
        return this.options;
    }

    getBalanceScheme(): Coin.BalanceScheme {
        return Coin.BalanceScheme.UTXO
    }

    getTransactionScheme(): Coin.TransactionScheme {
        return Coin.TransactionScheme.INPUTS_OUTPUTS
    }

    isMultiAddressAccount(): boolean {
        return true;
    }

    private readonly hdKeyFormat: Coin.Key.FormatInterface;

    constructor(protected options?: Coin.Options.BIPCoinOptions) {

        if (!options) {
            options = new Coin.Options.BIPCoinOptions();
        }

        if (!this.isSegWitAvailable) {
            options.useSegWit = false;
        }

        this.hdKeyFormat = new Coin.Key.BIPKeyFormat(this.networkInfo, options);
    }

    getKeyFormat(): Coin.Key.FormatInterface {
        return this.hdKeyFormat;
    }

    makePrivateFromSeed(seed: Buffer): Coin.Private.BasicMasterNode {
        return Coin.Private.BasicMasterNode.fromSeedBuffer(seed, this);
    }

    abstract getUnit(): Coin.Unit;

    abstract getName(): string;

    abstract getHDCoinType(): number;

    abstract get networkInfo(): Network;

    abstract get isSegWitAvailable(): boolean;

    abstract get defaultFeePerByte(): BigNumber;

    readonly minValue: BigNumber = new BigNumber(1).div(Constants.SATOSHI_PER_COIN);
}