import BigNumber from 'bignumber.js';
import HD from '../../../../hd';
import * as Coin from '../../../../coin';
import * as Entity from '../../../entity';
import * as Provider from '../../';
import { SimpleProvider } from '../simple-provider';
import { PrivateProvider } from './';

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
     *
     * @deprecated
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
     *
     * @deprecated
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


export abstract class AbstractPrivateProvider extends SimpleProvider implements PrivateProvider {
    protected readonly seed: Buffer;
    protected readonly privateCoin: Coin.Private.MasterNodeInterface;

    public constructor(seed: Buffer, wdProvider: Provider.WDProvider) {
        super(wdProvider);

        this.seed = seed;
        this.privateCoin = this.wdProvider.coin.makePrivateFromSeed(seed);
    }

    /**
     * @deprecated
     * @see FeeProviderInterface
     */
    public abstract calculateFee<Options = any>(
        value: BigNumber,
        address: Coin.Key.Address,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<plarkcore.CalculateFeeResponse>;


    /**
     * @deprecated
     * @see FeeProviderInterface
     */
    public abstract calculateMax<Options = any>(
        address: Coin.Key.Address,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<plarkcore.CalculateMaxResponse>;


    public abstract createTransaction<Options = any>(
        address: Coin.Key.Address,
        value: BigNumber,
        feeType: plarkcore.FeeType,
        options?: Options,
    ): Promise<Coin.Transaction.Transaction>;


    public deriveAddressNode(wdAddress: Entity.WalletAddress): Coin.Private.NodeInterface {
        return this.privateCoin
            .deriveAddress(wdAddress.type, wdAddress.index, wdAddress.account);
    }


    public deriveNew(type: HD.BIP44.AddressType): Entity.WalletAddress {
        const addrProvider = this.wdProvider.address;

        const newAddrIndex = addrProvider.count(type);
        const derivedAddress = this.privateCoin.deriveAddress(type, newAddrIndex, this.wdProvider.accountIndex);

        return addrProvider.add(
            derivedAddress.getPublicKey().toAddress().toString(),
            type,
            newAddrIndex,
        );
    }


    public broadcastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        if (false === transaction.isSigned) {
            throw new Error('Transaction must be signet!');
        }

        return this.wdProvider.getNetworkProvider().broadCastTransaction(transaction);
    }
}
