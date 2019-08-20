import bip32 from 'bip32';

export interface NodeInterface {
    getPublicKey(): Buffer

    getPrivateKey(): Buffer

    derive(index: number, hardened?: boolean): NodeInterface

    derivePath(path: string): NodeInterface
}

export class BasicNode implements NodeInterface {
    private bip32: bip32.BIP32;

    public constructor(node: bip32.BIP32) {
        this.bip32 = node;
    }

    public static fromSeedBuffer(seed: Buffer): BasicNode {
        return new BasicNode(bip32.fromSeed(seed));
    }

    public getPublicKey(): Buffer {
        return this.bip32.publicKey;
    }

    public getPrivateKey(): Buffer {
        return this.bip32.privateKey;
    }

    public derive(index: number, hardened?: boolean): NodeInterface {
        let derivedNode = hardened ?
            this.bip32.deriveHardened(index) :
            this.bip32.derive(index);

        return new BasicNode(derivedNode);
    }

    public derivePath(path: string): NodeInterface {
        let derivedNode = this.bip32.derivePath(path);

        return new BasicNode(derivedNode);
    }
}