import * as Coin from '../../coin';
import { WDGeneratorInterface } from './wd-generator';
import { BIPWalletGenerator } from './bip-wallet-generator';
import { EthereumWalletGenerator } from './ethereum-wallet-generator';

function createGenerator(coin: Coin.CoinInterface, seed: Buffer, option: any = {}): WDGeneratorInterface {
    if (coin instanceof Coin.BIPGenericCoin) {
        return new BIPWalletGenerator(coin, seed, option);
    }

    return new EthereumWalletGenerator(coin, seed, option);
}

export { createGenerator, WDGeneratorInterface };
