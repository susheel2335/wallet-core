import * as Coin from '../coin';
import { TAdapterOption } from './api';
import { AdapterMap } from './adapter';

export function getNetworkAdapter(coin: Coin.CoinInterface, index: number = 0): TAdapterOption {
    return AdapterMap[coin.getUnit()][index];
}

export function getNetworkAdapters(coin: Coin.CoinInterface): TAdapterOption[] {
    return AdapterMap[coin.getUnit()];
}
