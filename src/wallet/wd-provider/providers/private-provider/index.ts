import * as Coin from '../../../../coin';
import { Provider } from '../../../';
import { PrivateProvider } from './abstract-private-provider';
import { BIPPrivateProvider } from './bip-private-provider';
import { EthereumPrivateProvider } from './ethereum-private-provider';

export { PrivateProvider };

/**
 * @param {Buffer}              seed
 * @param {WDProvider}          wdProvider
 *
 * @return {PrivateProvider}
 */
export function createPrivateProvider(seed: Buffer, wdProvider: Provider.WDProvider): PrivateProvider {
    switch (wdProvider.coin.getTransactionScheme()) {
        case Coin.TransactionScheme.INPUTS_OUTPUTS: {
            return new BIPPrivateProvider(seed, wdProvider);
        }

        case Coin.TransactionScheme.FROM_TO: {
            return new EthereumPrivateProvider(seed, wdProvider);
        }
    }

    throw new Error('Not implemented!');
}
