export { getNetworkAdapter, getNetworkAdapters } from './utils';
import * as Coin from '../coin';
import { TAdapterOption } from './api';

export enum AdapterType {
    INSIGHT = 'insight',
    BLOCKBOOK = 'blockbook',
    ETHERSCAN = 'etherscan',
    // a symbiosis of two explorer - infura and etherscan
    INFURA = 'infura',
    BLOCKCYPHER_BIP = 'blockcypher-bip',
    BLOCKCYPHER_ETHER = 'blockcypher-ether'
}

export const AdapterMap: Record<string, TAdapterOption[]> = {};

// Bitcoin
AdapterMap[Coin.Unit.BTC] = [
    {
        type: AdapterType.BLOCKBOOK,
        url: 'https://btc.blockbook.plark.io/api/',
        wsUrl: 'wss://btc.blockbook.plark.io',
        version: '0.1.1',
    }, {
        type: AdapterType.INSIGHT,
        url: 'https://insight.bitpay.com/api',
        wsUrl: 'wss://insight.bitpay.com',
        version: '0.4.3',
    },
];

// Bitcoin Testnet
AdapterMap[Coin.Unit.BTCt] = [
    {
        type: AdapterType.BLOCKBOOK,
        url: 'https://tbtc1.trezor.io/api/',
        wsUrl: 'wss://tbtc1.trezor.io/',
        version: '0.1.1',
    }, {
        type: AdapterType.INSIGHT,
        url: 'https://btct.insight.plark.io/api',
        wsUrl: 'wss://btct.insight.plark.io',
        version: '0.4.3',
    },
];


// Litecoin
AdapterMap[Coin.Unit.LTC] = [
    {
        type: AdapterType.INSIGHT,
        url: 'https://ltc.insight.plark.io/api',
        wsUrl: 'wss://ltc.insight.plark.io/',
        version: '0.4.4',
    },
];

AdapterMap[Coin.Unit.LTCt] = [
    {
        type: AdapterType.INSIGHT,
        url: 'https://ltct.insight.plark.io/api',
        wsUrl: 'wss://ltct.insight.plark.io/',
        version: '0.4.4',
    },
];


// DashCoin
AdapterMap[Coin.Unit.DASH] = [
    {
        type: AdapterType.INSIGHT,
        url: 'https://dash.insight.plark.io/api',
        wsUrl: 'wss://dash.insight.plark.io/',
    },
];

// DashCoin
AdapterMap[Coin.Unit.DASHt] = [
    {
        type: AdapterType.INSIGHT,
        url: 'https://dasht.insight.plark.io/api',
        wsUrl: 'wss://dasht.insight.plark.io/',
    },
];

// Ethereum
AdapterMap[Coin.Unit.ETH] = [
    {
        type: AdapterType.INFURA,
        url: '<no specific url>',
        network: undefined,
    },
];

// Ethereum Testnet - Ropsten
AdapterMap[Coin.Unit.ETHt] = [
    {
        type: AdapterType.INFURA,
        url: 'https://api.infura.io',
        network: 'ropsten',
    },
];
