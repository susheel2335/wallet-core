import HD from '../hd';
import CoinInterface from './coin-interface';
import * as Key from './key';

export interface NodeInterface {
    getNode(): HD.Node.NodeInterface;

    getCoin(): CoinInterface;

    derive(index: number, hardened?: boolean): NodeInterface;

    derivePath(path: string): NodeInterface;

    getPublicKey(): Key.Public;

    getPrivateKey(): Key.Private;
}


export interface MasterNodeInterface extends NodeInterface {
    deriveAddress(addressType?: HD.BIP44.AddressType, index?: number, accountIndex?: number): NodeInterface;
}


/**
 * MasterNode and Coin container, compatible with BIP39 and BIP44
 */
export class BasicNode implements NodeInterface {

    protected readonly node: HD.Node.NodeInterface;
    protected readonly coin: CoinInterface;

    public constructor(node: HD.Node.NodeInterface, coin: CoinInterface) {
        this.node = node;
        this.coin = coin;
    }

    public getNode(): HD.Node.NodeInterface {
        return this.node;
    }

    public getCoin(): CoinInterface {
        return this.coin;
    }

    public derive(index: number, hardened?: boolean): BasicNode {
        return new BasicNode(this.getNode().derive(index, hardened), this.getCoin());
    }

    public derivePath(path: string): BasicNode {
        return new BasicNode(this.getNode().derivePath(path), this.getCoin());
    }

    public getPublicKey(): Key.Public {
        return new Key.Public(this.getNode().getPublicKey(), this.getCoin().getKeyFormat());
    }

    public getPrivateKey(): Key.Private {
        return new Key.Private(this.getNode().getPrivateKey(), this.getCoin().getKeyFormat());
    }
}

export class BasicMasterNode extends BasicNode implements MasterNodeInterface {
    private nodeCache: Record<string, BasicNode> = {};

    public deriveAddress(addressType: HD.BIP44.AddressType = HD.BIP44.AddressType.RECEIVE,
                         index: number = 0,
                         accountIndex: number = 0): BasicNode {

        let addressTypePath = HD.BIP44.getAddressTypeHDPath(this.getCoin().getHDCoinType(), accountIndex, addressType);

        if (!(addressTypePath in this.nodeCache)) {
            this.nodeCache[addressTypePath] = this.derivePath(addressTypePath);
        }

        return this.nodeCache[addressTypePath].derivePath(`${index}`);
    }

    public static fromSeedBuffer(seed: Buffer, coin: CoinInterface): BasicMasterNode {
        return new BasicMasterNode(HD.Node.BasicNode.fromSeedBuffer(seed), coin);
    }
}
