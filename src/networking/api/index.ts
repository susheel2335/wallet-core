import { AdapterType } from '../adapter';
import * as Infura from './infura';
import * as Insight from './insight';

export { default as Blockcypher } from './blockcypher';
export { default as EthereumBlockcypher } from './ethereum-blockcypher';
export { default as Etherscan } from './etherscan';
export { default as blockbook } from './blockbook';
export { Infura, Insight };

export type TAdapterOption = {
    type: AdapterType;
    url: string;
    wsUrl?: string;

    [key: string]: any;
};
