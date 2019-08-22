import * as Coin from '../../../../coin';
import { Provider } from '../../../';
import FeeProviderInterface from './fee-provider.interface';
import BIPFeeProvider from './fee-provider.bip';
import EtherFeeProvider from './fee-provider.ether';



/**
 * @param {WDProvider} wdProvider
 *
 * @return {FeeProviderInterface}
 */
function createFeeProvider(wdProvider: Provider.WDProvider): FeeProviderInterface {
    switch (wdProvider.coin.getTransactionScheme()) {
        case Coin.TransactionScheme.INPUTS_OUTPUTS: {
            return new BIPFeeProvider(wdProvider);
        }

        case Coin.TransactionScheme.FROM_TO: {
            return new EtherFeeProvider(wdProvider);
        }
    }

    throw new Error('Not implemented!');
}

export {
    FeeProviderInterface,
    createFeeProvider,
};
