import BigNumber from 'bignumber.js';
import { Coin, HD, Constants } from '../../../../';
import * as Entity from '../../../entity';
import * as Provider from '../../';
import { SimpleProvider } from '../simple-provider';
import { PrivateProvider } from './';

export abstract class AbstractPrivateProvider extends SimpleProvider implements PrivateProvider {
    protected readonly seed: Buffer;
    protected readonly privateCoin: Coin.Private.MasterNodeInterface;

    public constructor(seed: Buffer, wdProvider: Provider.WDProvider) {
        super(wdProvider);

        this.seed = seed;
        this.privateCoin = this.wdProvider.coin.makePrivateFromSeed(seed);
    }

    public abstract calculateFee<Options = any>(
        value: BigNumber,
        address: Coin.Key.Address,
        feeType: Constants.FeeTypes,
        options?: Options,
    ): Promise<plarkcore.CalculateFeeResponse>;


    /**
     * Method to calculate max value and fee to send
     *
     * @param {Address}     address
     * @param {FeeTypes}    feeType
     * @param {any}         options
     *
     * @return {Promise<CalculateMaxResponse>}
     */
    public abstract calculateMax<Options = any>(
        address: Coin.Key.Address,
        feeType: Constants.FeeTypes,
        options?: Options,
    ): Promise<plarkcore.CalculateMaxResponse>;


    public abstract createTransaction<Options = any>(
        address: Coin.Key.Address,
        value: BigNumber,
        feeType: Constants.FeeTypes,
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
