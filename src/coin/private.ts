import * as Coin from './coin';
import * as HD from '../hd';

export interface NodeInterface {
    getNode(): HD.Node.NodeInterface;

    getCoin(): Coin.CoinInterface;

    derive(index: number, hardened?: boolean): NodeInterface;

    derivePath(path: string): NodeInterface;

    getPublicKey(): Coin.Key.Public;

    getPrivateKey(): Coin.Key.Private;
}


export interface MasterNodeInterface extends NodeInterface {
    deriveAddress(addressType?: HD.BIP44.AddressType, index?: number, accountIndex?: number): NodeInterface;
}


/**
 * MasterNode and Coin container, compatible with BIP39 and BIP44
 */
export class BasicNode implements NodeInterface {

    protected readonly node: HD.Node.NodeInterface;
    protected readonly coin: Coin.CoinInterface;

    public constructor(node: HD.Node.NodeInterface, coin: Coin.CoinInterface) {
        this.node = node;
        this.coin = coin;
    }

    public getNode(): HD.Node.NodeInterface {
        return this.node;
    }

    public getCoin(): Coin.CoinInterface {
        return this.coin;
    }

    public derive(index: number, hardened?: boolean): BasicNode {
        return new BasicNode(this.getNode().derive(index, hardened), this.getCoin());
    }

    public derivePath(path: string): BasicNode {
        return new BasicNode(this.getNode().derivePath(path), this.getCoin());
    }

    public getPublicKey(): Coin.Key.Public {
        return new Coin.Key.Public(this.getNode().getPublicKey(), this.getCoin().getKeyFormat());
    }

    public getPrivateKey(): Coin.Key.Private {
        return new Coin.Key.Private(this.getNode().getPrivateKey(), this.getCoin().getKeyFormat());
    }
}

export class BasicMasterNode extends BasicNode implements MasterNodeInterface {

    private accountNodeCache = {};

    public deriveAddress(addressType: HD.BIP44.AddressType = HD.BIP44.AddressType.RECEIVE,
                         index: number = 0,
                         accountIndex: number = 0): BasicNode {

        if (!(accountIndex in this.accountNodeCache)) {
            let accountPath = HD.BIP44.getAccountHDPath(this.getCoin().getHDCoinType(), accountIndex);
            this.accountNodeCache[accountIndex] = this.derivePath(accountPath);
        }

        let derivePath = HD.BIP44.getHDPathFromAccount(addressType, index);

        return this.accountNodeCache[accountIndex].derivePath(derivePath);
    }

    public static fromSeedBuffer(seed: Buffer, coin: Coin.CoinInterface): BasicMasterNode {
        return new BasicMasterNode(HD.Node.BasicNode.fromSeedBuffer(seed), coin);
    }
}
