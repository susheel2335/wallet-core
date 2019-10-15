import BigNumber from 'bignumber.js';

import { BalanceScheme, TransactionScheme, Unit } from './entities';

import * as Options from './options';
import * as Key from './key';
import * as Private from './private';

export default interface CoinInterface {
    readonly minValue: BigNumber;

    getOptions(): Options.CoinOptionsInterface;

    getUnit(): Unit;

    getName(): string;

    getScheme(): string;

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

    /**
     * Method to create private key from seed
     *
     * @param {Buffer}      seed
     *
     * @return {MasterNodeInterface}
     */
    makePrivateFromSeed(seed: Buffer): Private.MasterNodeInterface;
}
