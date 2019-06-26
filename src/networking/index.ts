import * as Coin from '../coin';
import * as Adapter from './adapter';
import * as Api from './api';
import * as Clients from './clients';
import { NetworkProvider, INetworkProvider } from './network-provider';

export { getNetworkAdapters, getNetworkAdapter } from './utils';
export { createClient, firstNetworkClient } from './client-helper';
export { Clients, Api, Adapter, NetworkProvider, INetworkProvider };

export function createNetworkProvider(coin: Coin.CoinInterface): INetworkProvider {
    return new NetworkProvider(coin);
}
