import { AdapterType } from '../adapter';

import Blockcypher from './blockcypher';
import EthereumBlockcypher from './ethereum-blockcypher';
import Etherscan from './etherscan';
import blockbook from './blockbook';
import * as Infura from './infura';
import * as Insight from './insight';

export type TAdapterOption = {
    type: AdapterType;
    url: string;
    wsUrl?: string;

    [key: string]: any;
};

export {
    Blockcypher,
    EthereumBlockcypher,
    Etherscan,
    blockbook,
    Infura,
    Insight,
};
