import BigNumber from 'bignumber.js';
import CoinInterface from '../coin-interface';
import { BalanceScheme, TransactionScheme, Unit } from '../entities';
import { FormatInterface, EthereumKeyFormat } from '../key';
import * as Options from '../options';
import * as Private from '../private';
import * as Constants from '../../constants';

export default class Ethereum implements CoinInterface {
    public readonly minValue: BigNumber = new BigNumber(1).div(Constants.WEI_PER_COIN);

    // Default transaction gas limit
    public readonly defaultGasLimit: number = 53000;

    // Default Gas Price set to 8 GWei
    public readonly defaultGasPrice: BigNumber = new BigNumber(8).div(Constants.GWEI_PER_COIN);

    // Mainnet Tx EIP155
    public readonly chainId: number = 1;

    public constructor(protected options?: Options.EthereumOptions) {
    }

    public getOptions(): Options.EthereumOptions {
        return this.options;
    }

    public getBalanceScheme(): BalanceScheme {
        return BalanceScheme.ADDRESS_BALANCE;
    }

    public getTransactionScheme(): TransactionScheme {
        return TransactionScheme.FROM_TO;
    }

    public isMultiAddressAccount(): boolean {
        return false;
    }

    public isBIPType(): boolean {
        return false;
    }

    public makePrivateFromSeed(seed: Buffer): Private.BasicMasterNode {
        return Private.BasicMasterNode.fromSeedBuffer(seed, this);
    }

    public getUnit(): Unit {
        return Unit.ETH;
    }

    public getName(): string {
        return 'Ethereum';
    }

    public getHDCoinType(): number {
        return 60;
    }

    public getKeyFormat(): FormatInterface {
        return new EthereumKeyFormat;
    }

    public getScheme(): string {
        return this.getName()
                   .replace(/\S/g, '')
                   .toLowerCase();
    }
}
