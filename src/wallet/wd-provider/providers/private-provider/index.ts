import BigNumber from 'bignumber.js';

import { Coin, HD } from '../../../../';
import { Entity, Provider } from '../../../';
import { BIPPrivateProvider } from './bip-private-provider';
import { EthereumPrivateProvider } from './ethereum-private-provider';

export interface PrivateProvider {
    /**
     * Method return {Coin.Private.NodeInterface} of specific address from WalletData
     *
     * @param {WalletAddress} wdAddress
     *
     * @return {NodeInterface}
     */
    deriveAddressNode(wdAddress: Entity.WalletAddress): Coin.Private.NodeInterface;


    /**
     * Method create and return {Entity.WalletAddress} for current WalletData,
     * derived by current private coin
     *
     * @param {AddressType}     type
     *
     * @returns {WalletAddress}
     */
    deriveNew(type: HD.BIP44.AddressType): Entity.WalletAddress;


    /**
     * @param {BigNumber}           value
     * @param {Address}             address
     * @param {plarkcore.FeeType}   feeType
     * @param {any}                 options
     *
     * @return {Promise<CalculateFeeResponse>}
     */
    calculateFee<Options = any>(
        value: BigNumber,
        address: Coin.Key.Address,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<plarkcore.CalculateFeeResponse>;


    /**
     * Method to calculate max value and fee to send
     *
     * @param {Address}             address
     * @param {plarkcore.FeeType}   feeType
     * @param {any}                 options
     *
     * @return {Promise<CalculateMaxResponse>}
     */
    calculateMax<Options = any>(
        address: Coin.Key.Address,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<plarkcore.CalculateMaxResponse>;


    /**
     * Create transaction to specific address with some value
     *
     * @param {Address}             address
     * @param {BigNumber}           value
     * @param {plarkcore.FeeType}   feeType
     * @param {any}                 options
     *
     * @returns {Promise<Transaction>}
     */
    createTransaction<Options = any>(
        address: Coin.Key.Address,
        value: BigNumber,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<Coin.Transaction.Transaction>;


    /**
     * Broadcast transaction to Network
     *
     * @param {Transaction}     transaction
     *
     * @return {Promise<string>}
     */
    broadcastTransaction(transaction: Coin.Transaction.Transaction): Promise<string>;
}


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
