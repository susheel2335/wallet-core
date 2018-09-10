import BigNumber from 'bignumber.js';

import { BalanceScheme, TransactionScheme, Unit } from './entities';

import * as Options from './options';
import * as Key from './key';
import * as Private from './private';

export interface CoinInterface {
    readonly minValue: BigNumber;

    getOptions(): Options.CoinOptionsInterface;

    getUnit(): Unit;

    getName(): string;

    /**
     * Returns coin type according to SLIP-0044.
     *
     * @link https://github.com/satoshilabs/slips/blob/master/slip-0044.md
     * @returns {number}
     */
    getHDCoinType(): number;

    getKeyFormat(): Key.FormatInterface;

    getBalanceScheme(): BalanceScheme;

    getTransactionScheme(): TransactionScheme;

    isMultiAddressAccount(): boolean;

    isBIPType(): boolean;

    makePrivateFromSeed(seed: Buffer): Private.MasterNodeInterface
}