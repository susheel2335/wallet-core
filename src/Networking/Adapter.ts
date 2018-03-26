import {AdapterOptionInterface, AdapterPropsInterface} from "./Api";
import * as Coin from "../Coin";
import {BIPCoinOptions} from "../Coin/Options";
import * as Api from "./Api";

enum AdapterType {
    INSIGHT = 'insight',
    ETHERSCAN = 'etherscan',
    // a symbios of two explorer - infura and etherscan
    INFURA = 'infura',
    BLOCKCYPHER_BIP = 'blockcypher-bip',
    BLOCKCYPHER_ETHER = 'blockcypher-ether'
}

const AdapterMap = [];

// Bitcoin
AdapterMap[Coin.Unit.BTC] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://insight.bitpay.com/api',
        wsUrl: 'wss://insight.bitpay.com',
        version: '0.4.3'
    }
}, {
    type: AdapterType.BLOCKCYPHER_BIP,
    options: {
        url: 'https://api.blockcypher.com/v1/btc/main',
        wsUrl: 'wss://socket.blockcypher.com/v1/btc/main'
    }
}, {
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://localbitcoinschain.com/api'
    }
}];

// Bitcoin Testnet
AdapterMap[Coin.Unit.BTCt] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://test-insight.bitpay.com/api',
        wsUrl: 'wss://test-insight.bitpay.com',
        version: '0.4.3'
    }
}, {
    type: AdapterType.BLOCKCYPHER_BIP,
    options: {
        url: 'https://api.blockcypher.com/v1/btc/test3',
        wsUrl: 'wss://socket.blockcypher.com/v1/btc/test3'
    }
}];


// Litecoin
AdapterMap[Coin.Unit.LTC] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://insight.litecore.io/api',
        wsUrl: 'wss://insight.litecore.io/',
        version: '0.4.4'
    }
}, {
    type: AdapterType.BLOCKCYPHER_BIP,
    options: {
        url: 'https://api.blockcypher.com/v1/ltc/main',
        wsUrl: 'wss://socket.blockcypher.com/v1/ltc/main'
    }
}];

AdapterMap[Coin.Unit.LTCt] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://test.ltc.explorer.berrywallet.io/api',
        wsUrl: 'wss://test.ltc.explorer.berrywallet.io/',
        version: '0.4.4'
    }
}];


// DashCoin
AdapterMap[Coin.Unit.DASH] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://insight.dash.org/insight-api-dash',
        wsUrl: 'https://insight.dash.org/'
    }
}, {
    type: AdapterType.BLOCKCYPHER_BIP,
    options: {
        url: 'https://api.blockcypher.com/v1/dash/main',
        wsUrl: 'wss://socket.blockcypher.com/v1/dash/main'
    }
}];

// DashCoin
AdapterMap[Coin.Unit.DASHt] = [{
    type: AdapterType.INSIGHT,
    options: {
        url: 'https://testnet-insight.dashevo.org/insight-api-dash',
        wsUrl: 'wss://testnet-insight.dashevo.org/'
    }
}];

// Ethereum
AdapterMap[Coin.Unit.ETH] = [{
    type: AdapterType.INFURA,
    options: {
        url: '<no specific url>',
        network: null
    }
}];

// Ethereum Testnet - Ropsten
AdapterMap[Coin.Unit.ETHt] = [{
    type: AdapterType.INFURA,
    options: {
        url: '<no specific url>',
        network: 'ropsten'
    }
}];

function getNetworkAdapter(coin: Coin.CoinInterface, index: number = 0): AdapterPropsInterface {
    return AdapterMap[coin.getUnit()][index];
}

function getNetworkAdapters(coin: Coin.CoinInterface): AdapterPropsInterface[] {
    return AdapterMap[coin.getUnit()];
}


export {
    AdapterType,
    AdapterMap,
    getNetworkAdapter,
    getNetworkAdapters
}