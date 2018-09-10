import { AdapterType } from '../adapter';

import * as Blockcypher from './blockcypher';
import * as EthereumBlockcypher from './ethereum-blockcypher';
import * as Etherscan from './etherscan';
import * as Infura from './infura';
import * as Insight from './insight';

export type TAdapterOption = {
    type: AdapterType;
    url: string;
    wsUrl?: string;

    [key: string]: any;
};

export { Blockcypher, EthereumBlockcypher, Etherscan, Infura, Insight };
