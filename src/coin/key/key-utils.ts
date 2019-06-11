import BitcoinJS from 'bitcoinjs-lib';
import { Utils } from '../../utils';
import { CoinOptionsInterface } from '../options';

export enum AddressFormat {
    P2PKH = 'P2PKH',
    P2SH = 'P2SH',
    BECH32 = 'BECH32'
}

export interface FormatInterface {
    isValidAddress(address: string): boolean;

    isValidPublicKey(publicKey: string): boolean;

    isValidPrivateKey(privateKey: string): boolean;

    parseAddress(address: string): Address;

    parsePublicKey(publicKey: string): Public;

    parsePrivateKey(privateKey: string): Private;

    publicToAddress(publicKey: Public, format?: AddressFormat): Address;

    formatAddress(rawAddress: Address, options?: any): string;

    formatPublicKey(buffer: Buffer, options?: any): string;

    formatPrivateKey(buffer: Buffer, options?: any): string;
}


export class Address {
    protected readonly format: AddressFormat;
    protected readonly data: Buffer;
    protected readonly formatter: FormatInterface;

    public constructor(format: AddressFormat, data: Buffer, formatter: FormatInterface) {
        this.format = format;
        this.data = data;
        this.formatter = formatter;
    }

    public getFormat(): AddressFormat {
        return this.format;
    }

    public getData(): Buffer {
        return this.data;
    }

    public toString(options?: any): string {
        return this.formatter.formatAddress(this, options);
    }
}


export class Public {
    protected readonly key: Buffer;
    protected readonly formatter: FormatInterface;

    public constructor(key: Buffer, formatter: FormatInterface) {
        this.key = key;
        this.formatter = formatter;
    }

    public toBuffer(): Buffer {
        return this.key;
    }

    public toAddress(format?: AddressFormat): Address {
        return this.formatter.publicToAddress(this, format);
    }

    public toString(options?: any): string {
        return this.formatter.formatPublicKey(this.toBuffer(), options);
    }
}


export class Private {
    protected readonly key: Buffer;
    protected readonly formatter: FormatInterface;

    public constructor(key: Buffer, formatter: FormatInterface) {
        this.key = key;
        this.formatter = formatter;
    }

    public toBuffer(): Buffer {
        return this.key;
    }

    public toString(options?: CoinOptionsInterface): string {
        return this.formatter.formatPrivateKey(this.toBuffer(), options);
    }
}


export function getRedeemScript(pubKey: Buffer): Buffer {
    const publicKeyHash = Utils.Crypto.hash160(pubKey);

    return BitcoinJS.script.witnessPubKeyHash.output.encode(publicKeyHash);
}
