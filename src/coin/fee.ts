import BigNumber from 'bignumber.js';
import * as Coin from '../coin';

export enum FeeTypes {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}

export type CalculateFeeResponse = {
    coin: Coin.Unit;
    fee: BigNumber;
    feeType: FeeTypes;

    [key: string]: any;
}
