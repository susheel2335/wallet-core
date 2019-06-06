import * as Coin from '../coin';
import { AdapterType } from '../constants';
import * as Clients from './clients';
import * as Adapter from './adapter';

export function createClient(coin: Coin.CoinInterface, params: plarkcore.AdapterOption): Clients.NetworkClient {
    switch (params.type) {
        case AdapterType.INSIGHT:
            return new Clients.InsightNetworkClient(coin, params);

        case AdapterType.BLOCKBOOK:
            return new Clients.BlockbookNetworkClient(coin, params);

        case AdapterType.INFURA:
            return new Clients.InfuraNetworkClient(coin, params);

        case AdapterType.BLOCKCYPHER_BIP:
            return new Clients.BlockcypherBIPNetworkClient(coin, params);

        case AdapterType.ETHERSCAN: {
            throw new Error('Etherscan is temporary disabled.');
        }

        case AdapterType.BLOCKCYPHER_ETHER:
            throw new Error('You have to implement BLOCKCYPHER_ETHER');
    }

    throw new Error(`Adapter Type ${params.type} has not implemented`);
}


export function firstNetworkClient(coin: Coin.CoinInterface, index?: number): Clients.NetworkClient {
    return createClient(coin, Adapter.getNetworkAdapter(coin, index));
}
