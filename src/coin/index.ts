import * as Key from './key';
import * as Defined from './defined';
import * as Private from './private';
import * as Options from './options';
import * as Transaction from './transaction';
import CoinInterface from './coin-interface';
import { Unit } from './entities';

export * from './entities';
export { Key, Defined, Private, Options, Transaction, CoinInterface };
export { parseAddressByCoin } from './helper';
export { BIPGenericCoin } from './bip-generic-coin';

export const coinMap = {};

coinMap[Unit.BTC] = Defined.Bitcoin;
coinMap[Unit.BCH] = Defined.BitcoinCash;
coinMap[Unit.ETH] = Defined.Ethereum;
coinMap[Unit.LTC] = Defined.Litecoin;
coinMap[Unit.DASH] = Defined.Dash;

coinMap[Unit.BTCt] = Defined.BitcoinTestnet;
coinMap[Unit.BCHt] = Defined.BitcoinCashTestnet;
coinMap[Unit.ETHt] = Defined.EthereumRopstenTestnet;
coinMap[Unit.LTCt] = Defined.LitecoinTestnet;
coinMap[Unit.DASHt] = Defined.DashTestnet;


export function makeCoin(unit: Unit, options?: Options.CoinOptionsInterface): CoinInterface {
    const coinClass = coinMap[unit];
    if (!coinClass) {
        throw new Error(`Coin unit '${unit}' not found!`);
    }

    return new (coinClass)(options);
}


export function makePrivateCoin(unit: Unit, seed: Buffer, options?: Options.CoinOptionsInterface): Private.MasterNodeInterface {
    return makeCoin(unit, options).makePrivateFromSeed(seed);
}
