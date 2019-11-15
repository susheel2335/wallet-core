import BigNumber from 'bignumber.js';
import * as Constants from '../../constants';
import { Unit } from '../entities';
import Ethereum from './ethereum';


export default class EthereumRopstenTestnet extends Ethereum {
    public readonly defaultGasPrice: BigNumber = new BigNumber(8).div(Constants.GWEI_PER_COIN); //5 GWei

    public readonly chainId: number = 3;

    public getUnit(): Unit {
        return Unit.ETHt;
    }

    public getName(): string {
        return 'Ethereum Ropsten Testnet';
    }
}
