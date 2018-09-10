import * as Coin from '../../coin';
import { WDGeneratorInterface } from './wd-generator';
import { BIPWalletGenerator } from './bip-wallet-generator';
import { EthereumWalletGenerator } from './ethereum-wallet-generator';

export function createGenerator(coin: Coin.CoinInterface, seed: Buffer): WDGeneratorInterface {
    if (coin instanceof Coin.BIPGenericCoin) {
        return new BIPWalletGenerator(coin, seed);
    }

    return new EthereumWalletGenerator(coin, seed);
}

export { WDGeneratorInterface };
