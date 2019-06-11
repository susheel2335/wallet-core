import * as EthereumJsUtil from 'ethereumjs-util';
import { Utils } from '../../utils';
import { FormatInterface, Address, Public, Private, AddressFormat } from './key-utils';

export class EthereumKeyFormat implements FormatInterface {

    public isValidAddress(address: string): boolean {
        return EthereumJsUtil.isValidAddress(address);
    }

    public isValidPublicKey(publicKey: string): boolean {
        if (Utils.isHexValid(publicKey, 33, 1)) {
            return EthereumJsUtil.isValidPublic(Utils.hexToBuffer(publicKey), true);
        }

        return false;
    }


    public isValidPrivateKey(privateKey: string): boolean {
        if (Utils.isHexValid(privateKey, 33, 1)) {
            return EthereumJsUtil.isValidPrivate(Utils.hexToBuffer(privateKey));
        }

        return false;
    }


    public parseAddress(address: string): Address {
        if (!this.isValidAddress(address)) {
            throw new TypeError(`Invalid address ${address}`);
        }

        return new Address(AddressFormat.P2PKH, Utils.hexToBuffer(address), this);
    }


    public parsePublicKey(publicKey: string): Public {
        if (!this.isValidAddress(publicKey)) {
            throw new TypeError(`Invalid public key ${publicKey}`);
        }

        return new Public(Utils.hexToBuffer(publicKey), this);
    }


    public parsePrivateKey(privateKey: string): Private {
        if (!this.isValidPrivateKey(privateKey)) {
            throw new TypeError(`Invalid private key ${privateKey}`);
        }

        return new Private(Utils.hexToBuffer(privateKey), this);
    }


    public publicToAddress(publicKey: Public): Address {
        let addressBuffer = EthereumJsUtil.pubToAddress(publicKey.toBuffer(), true) as Buffer;

        return new Address(AddressFormat.P2PKH, addressBuffer, this);
    }


    public formatAddress(keyAddr: Address, options?: any): string {
        let address = EthereumJsUtil.addHexPrefix(keyAddr.getData().toString('hex'));

        let checkSummed = (options && 'checksummed' in options) ? options.checksummed : false;
        if (checkSummed) {
            address = EthereumJsUtil.toChecksumAddress(address);
        }

        return address;
    }


    public formatPublicKey(buffer: Buffer, options?: any): string {
        return EthereumJsUtil.addHexPrefix(buffer.toString('hex'));
    }


    public formatPrivateKey(buffer: Buffer, options?: any): string {
        return EthereumJsUtil.addHexPrefix(buffer.toString('hex'));
    }
}
