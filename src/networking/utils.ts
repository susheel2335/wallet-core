import * as Coin from '../coin';
import { AdapterMap } from './adapter';

export function getNetworkAdapter(coin: Coin.CoinInterface, index: number = 0): plarkcore.AdapterOption {
    return AdapterMap[coin.getUnit()][index];
}

export function getNetworkAdapters(coin: Coin.CoinInterface): plarkcore.AdapterOption[] {
    return AdapterMap[coin.getUnit()];
}
