import * as BigInteger from 'bigi';
import {HDNode, ECPair} from "bitcoinjs-lib";


const WIF = require('wif');


export interface NodeInterface {

    getPublicKey(): Buffer

    getPrivateKey(): Buffer

    derive(index: number, hardened?: boolean): NodeInterface

    derivePath(path: string): NodeInterface

}

export class BasicNode implements NodeInterface {

    private hdNode: HDNode;

    constructor(pi: BigInteger, chainCode: Buffer) {
        this.hdNode = new HDNode(
            new ECPair(pi, null, {compressed: true}),
            chainCode
        );
    }

    static fromBitcoinJsHDNode(hdNode: HDNode): BasicNode {
        return new BasicNode((hdNode.keyPair as any).d, (hdNode as any).chainCode);
    }

    static fromSeedBuffer(seed: Buffer): BasicNode {
        return BasicNode.fromBitcoinJsHDNode(HDNode.fromSeedBuffer(seed));
    }

    getECKeyPair(): ECPair {
        return this.hdNode.keyPair;
    }

    getPublicKey(): Buffer {
        return this.hdNode.getPublicKeyBuffer()
    }

    getPrivateKey(): Buffer {
        let wif: any = WIF.decode(this.hdNode.keyPair.toWIF());
        return wif.privateKey;
    }

    derive(index: number, hardened?: boolean): NodeInterface {
        let derivedNode = hardened ?
            this.hdNode.deriveHardened(index) :
            this.hdNode.derive(index);

        return BasicNode.fromBitcoinJsHDNode(derivedNode);
    }

    derivePath(path: string): NodeInterface {
        let derivedNode = this.hdNode.derivePath(path);

        return BasicNode.fromBitcoinJsHDNode(derivedNode);
    }
}