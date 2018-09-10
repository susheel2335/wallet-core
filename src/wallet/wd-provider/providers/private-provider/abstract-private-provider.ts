import BigNumber from 'bignumber.js';
import { Coin, HD } from '../../../../';
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


    public abstract calculateFee(value: BigNumber,
                                 address: Coin.Key.Address,
                                 feeType: Coin.FeeTypes): Promise<BigNumber>;


    public abstract createTransaction(address: Coin.Key.Address,
                                      value: BigNumber,
                                      feeType: Coin.FeeTypes): Promise<Coin.Transaction.Transaction>;


    public deriveAddressNode(wdAddress: Entity.WalletAddress): Coin.Private.NodeInterface {
        return this.privateCoin.deriveAddress(wdAddress.type, wdAddress.index);
    }


    public deriveNew(type: HD.BIP44.AddressType): Entity.WalletAddress {

        const addrProvider = this.wdProvider.address;

        const newAddrIndex = addrProvider.count(type);
        const derivedAddress = this.privateCoin.deriveAddress(type, newAddrIndex);

        return addrProvider.add(derivedAddress.getPublicKey().toAddress().toString(), type, newAddrIndex);
    }


    public broadcastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        if (false === transaction.isSigned) {
            throw new Error('Transaction must be signet!');
        }

        return this.wdProvider.getNetworkProvider().broadCastTransaction(transaction);
    }
}
