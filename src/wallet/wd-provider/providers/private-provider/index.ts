import BigNumber from 'bignumber.js';

import { Coin, HD, Constants } from '../../../../';
import { Entity, Provider } from '../../../';
import { BIPPrivateProvider } from './bip-private-provider';
import { EthereumPrivateProvider } from './ethereum-private-provider';

export interface PrivateProvider {
    /**
     * Method return {Coin.Private.NodeInterface} of specific address from WalletData
     *
     * @param {WalletAddress} wdAddress
     * @returns {NodeInterface}
     */
    deriveAddressNode(wdAddress: Entity.WalletAddress): Coin.Private.NodeInterface;

    /**
     * Method create and return {Entity.WalletAddress} for current WalletData,
     * derived by current private coin
     *
     * @param {AddressType} type
     *
     * @returns {WalletAddress}
     */
    deriveNew(type: HD.BIP44.AddressType): Entity.WalletAddress;

    /**
     * @param {BigNumber} value
     * @param {Address} address
     * @param {FeeTypes} feeType
     * @param {any} options
     *
     * @returns {Promise<CalculateFeeResponse>}
     */
    calculateFee<Options = any>(
        value: BigNumber,
        address: Coin.Key.Address,
        feeType: Constants.FeeTypes,
        options?: Options
    ): Promise<plarkcore.CalculateFeeResponse>;

    /**
     * Create transaction to specific address with some value
     *
     * @param {Address} address
     * @param {BigNumber} value
     * @param {FeeTypes} feeType
     * @param {any} options
     *
     * @returns {Promise<Transaction>}
     */
    createTransaction<Options = any>(
        address: Coin.Key.Address,
        value: BigNumber,
        feeType: Constants.FeeTypes,
        options?: Options,
    ): Promise<Coin.Transaction.Transaction>;

    /**
     * Broadcast transaction to Network
     *
     * @param {Transaction} transaction
     */
    broadcastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;
}


/**
 * @param {Buffer} seed
 * @param {WDProvider} wdProvider
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
