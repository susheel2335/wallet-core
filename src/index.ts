import BigNumber from 'bignumber.js';

//configure BigNumber for higher precision
BigNumber.config({
    DECIMAL_PLACES: 100,
});

import * as Constants from './constants';
import * as Debug from './debugger';
import Exceptions from './exceptions';
import HD from './hd';
import * as Coin from './coin';
import * as Networking from './networking';
import * as Wallet from './wallet';

import './global';

export { Utils } from './utils';
export { Constants, Coin, HD, Wallet, Networking, Debug, Exceptions };
export const CoinUnit = Coin.Unit;
export const coinMap = Coin.coinMap;
export const makeCoin = Coin.makeCoin;
