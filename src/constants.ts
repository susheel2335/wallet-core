import BigNumber from 'bignumber.js';

export enum FeeTypes {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}

export enum AdapterType {
    INSIGHT = 'insight',
    BLOCKBOOK = 'blockbook',
    ETHERSCAN = 'etherscan',
    // a symbiosis of two explorer - infura and etherscan
    INFURA = 'infura',
    BLOCKCYPHER_BIP = 'blockcypher-bip',
    BLOCKCYPHER_ETHER = 'blockcypher-ether'
}

export const ETHERSCAN_API_KEY = 'PY4P1BMTRKT3E2J1IQGVEFVVNGZ5FTSUMG';
export const INFURA_APP_ID = '19d88e5db236483ab0e0c4e2e20f4244';

export const MIN_ADDRESS_COUNT = 10;

export const WD_UPDATE_TIMEOUT = 2000;

export const SATOSHI_PER_COIN = new BigNumber(1E8);

//Ethereum units
export const WEI_PER_COIN = new BigNumber(1E18);
export const KWEI_PER_COIN = new BigNumber(1E15);
export const MWEI_PER_COIN = new BigNumber(1E12);
export const GWEI_PER_COIN = new BigNumber(1E9);


export const MIN_GAS_LIMIT = new BigNumber(54000);
