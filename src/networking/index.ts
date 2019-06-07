import * as Coin  from '../coin';
import * as Adapter from './adapter';
import * as Api from './api';
import * as Clients from './clients';
import { NetworkProvider, INetworkProvider } from './network-provider';
import { getNetworkAdapters, getNetworkAdapter } from './utils';
import { createClient, firstNetworkClient } from './client-helper';


function createNetworkProvider(coin: Coin.CoinInterface): INetworkProvider {
    return new NetworkProvider(coin);
}


export {
    Clients,
    Api,
    Adapter,
    NetworkProvider,
    INetworkProvider,
    getNetworkAdapters,
    getNetworkAdapter,
    createClient,
    firstNetworkClient,
    createNetworkProvider,
};
