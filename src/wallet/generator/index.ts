import * as Coin from '../../coin';
import { INetworkProvider } from '../../networking';
import { WDGeneratorInterface } from './wd-generator';
import { BIPWalletGenerator } from './bip-wallet-generator';
import { EthereumWalletGenerator } from './ethereum-wallet-generator';


function createGenerator(
    coin: Coin.CoinInterface,
    seed: Buffer,
    networkProvider: INetworkProvider,
    option: any = {},
): WDGeneratorInterface {
    if (coin instanceof Coin.BIPGenericCoin) {
        return new BIPWalletGenerator(coin, seed, networkProvider, option);
    }

    return new EthereumWalletGenerator(coin, seed, networkProvider, option);
}


export { createGenerator, WDGeneratorInterface };
