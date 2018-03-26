import {AdapterType} from "../Adapter";

import * as Blockcypher from './Blockcypher';
import * as EthereumBlockcypher from './EthereumBlockcypher';
import * as Etherscan from './Etherscan';
import * as Infura from './Infura';
import * as Insight from './Insight';


interface AdapterOptionInterface {
    url: string;
    wsUrl?: string;

    [key: string]: any;
}


interface AdapterPropsInterface {
    type: AdapterType;
    options: AdapterOptionInterface;
}

export {
    AdapterOptionInterface,
    AdapterPropsInterface,

    Blockcypher,
    EthereumBlockcypher,
    Etherscan,
    Infura,
    Insight
}