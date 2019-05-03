import * as Coin from '../coin';
import * as Api from './api';
import * as Clients from './clients';
import * as Adapter from './adapter';

export function createClient(coin: Coin.CoinInterface, params: Api.TAdapterOption): Clients.NetworkClient {
    switch (params.type) {
        case Adapter.AdapterType.INSIGHT:
            return new Clients.InsightNetworkClient(coin, params);

        case Adapter.AdapterType.BLOCKBOOK:
            return new Clients.BlockbookNetworkClient(coin, params);

        case Adapter.AdapterType.INFURA:
            return new Clients.InfuraNetworkClient(coin, params);

        case Adapter.AdapterType.BLOCKCYPHER_BIP:
            return new Clients.BlockcypherBIPNetworkClient(coin, params);

        case Adapter.AdapterType.ETHERSCAN: {
            throw new Error('Etherscan is temporary disabled.');
        }

        case Adapter.AdapterType.BLOCKCYPHER_ETHER:
            throw new Error('You have to implement BLOCKCYPHER_ETHER');
    }

    throw new Error(`Adapter Type ${params.type} has not implemented`);
}


export function firstNetworkClient(coin: Coin.CoinInterface, index?: number): Clients.NetworkClient {
    return createClient(coin, Adapter.getNetworkAdapter(coin, index));
}
