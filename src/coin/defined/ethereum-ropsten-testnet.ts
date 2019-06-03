import BigNumber from 'bignumber.js';
import * as Coin from '../';
import { Ethereum } from './ethereum';
import * as Constants from '../../constants';


export class EthereumRopstenTestnet extends Ethereum {
    public readonly defaultGasPrice: BigNumber = new BigNumber(8).div(Constants.GWEI_PER_COIN); //5 GWei

    public readonly chainId: number = 3;

    public getUnit(): Coin.Unit {
        return Coin.Unit.ETHt;
    }

    public getName(): string {
        return 'EthereumRopstenTestnet';
    }

    public getHDCoinType(): number {
        return 60;
    }
}
