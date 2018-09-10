import BitcoinJS from 'bitcoinjs-lib';
import WIF from 'wif';
import * as Key from './';
import * as Utils from '../../utils';
import { BIPCoinOptions } from '../options';
import { AddressFormat } from './';

type ParsedAddressData = {
    version: number;
    prefix?: string;

    hash?: Buffer;
    data?: Buffer;
};

export class BIPKeyFormat implements Key.FormatInterface {

    private readonly network: BitcoinJS.Network;
    private readonly options: BIPCoinOptions;


    public constructor(network: BitcoinJS.Network, options: BIPCoinOptions) {
        this.network = network;
        this.options = options;
    }


    public isValidAddress(address: string): boolean {
        try {
            this.parseAddress(address);
            return true;
        } catch (e) {
            return false;
        }
    }


    public isValidPublicKey(publicKey: string): boolean {
        return Utils.isHexValid(publicKey, 33, 0);
    }


    public isValidPrivateKey(privateKey: string): boolean {
        try {
            this.parsePrivateKey(privateKey);
            return true;
        } catch (e) {
            return false;
        }
    }


    public parseAddress(address: string): Key.Address {
        let addr: ParsedAddressData = undefined;
        try {
            try {
                addr = BitcoinJS.address.fromBase58Check(address) as ParsedAddressData;
            } catch (e) {
                if (this.network.bech32 === undefined) {
                    throw e;
                }

                addr = BitcoinJS.address.fromBech32(address) as ParsedAddressData;

                if (addr.prefix !== this.network.bech32) {
                    throw new TypeError(
                        `Invalid prefix ${this.network.bech32} for address ${address}, ${addr.prefix}`,
                    );
                }

                return new Key.Address(Key.AddressFormat.BECH32, addr.data, this);
            }
        } catch (e) {
            throw new TypeError(
                `Error on parse address (${this.network.pubKeyHash} / ${this.network.scriptHash}) - ${address}. Error: ${e.message}`,
            );
        }

        switch (addr.version) {
            case this.network.pubKeyHash:
                return new Key.Address(Key.AddressFormat.P2PKH, addr.hash, this);

            case this.network.scriptHash:
                return new Key.Address(Key.AddressFormat.P2SH, addr.hash, this);
        }

        throw new TypeError(
            `Invalid address version (${this.network.pubKeyHash} / ${this.network.scriptHash}) - ${address}. Current version ${addr.version}`,
        );
    }


    public parsePublicKey(publicKey: string): Key.Public {
        if (!this.isValidPublicKey(publicKey)) {
            throw new TypeError(`Public key ${publicKey} is not valid`);
        }

        let buf = Buffer.from(publicKey, 'hex');

        return new Key.Public(buf, this);
    }


    public parsePrivateKey(privateKey: string): Key.Private {
        let wif: any;
        try {
            wif = WIF.decode(privateKey);
        } catch (e) {
            throw new TypeError(`Invalid ${this.network.wif} privkey ${privateKey}. ${e.message}`);
        }

        if (wif.version != this.network.wif) {
            throw new TypeError(`Invalid ${this.network.wif} privkey ${privateKey}.`);
        }

        return new Key.Private(wif.privateKey, this);
    }


    public publicToAddress(publicKey: Key.Public, format: AddressFormat = AddressFormat.P2PKH): Key.Address {
        let data;

        switch (format) {
            case AddressFormat.P2PKH: {
                data = Utils.Crypto.hash160(publicKey.toBuffer());
                break;
            }

            case AddressFormat.P2SH: {
                const redeemScript = Key.getRedeemScript(publicKey.toBuffer());

                const hash = BitcoinJS.script.scriptHash.output.encode(
                    Utils.Crypto.hash160(redeemScript),
                );

                let addressStr = BitcoinJS.address.fromOutputScript(hash, this.network) as string;

                data = BitcoinJS.address.fromBase58Check(addressStr).hash;
                break;
            }

            case AddressFormat.BECH32: {
                if (this.network.bech32 === undefined) {
                    throw new TypeError('Coin not support SegWit address');
                }

                const redeemScript = Key.getRedeemScript(publicKey.toBuffer());

                /* Bicycle make of pure gold */
                const publicKeyScript = BitcoinJS.address.fromOutputScript(redeemScript);

                data = BitcoinJS.address.fromBech32(publicKeyScript).data;
            }

        }

        return new Key.Address(format, data, this);
    }


    public formatAddress(address: Key.Address, options?: any): string {

        switch (address.getFormat()) {
            case Key.AddressFormat.P2PKH:
                return BitcoinJS.address.toBase58Check(address.getData(), this.network.pubKeyHash);

            case Key.AddressFormat.P2SH:
                return BitcoinJS.address.toBase58Check(address.getData(), this.network.scriptHash);

            case Key.AddressFormat.BECH32:
                if (!this.network.bech32) {
                    throw new TypeError('Coin not support SegWit address');
                }

                return BitcoinJS.address.toBech32(address.getData(), 0, this.network.bech32);
        }
    }


    public formatPublicKey(buffer: Buffer, options?: any): string {
        return buffer.toString('hex');
    }


    public formatPrivateKey(buffer: Buffer, options?: any): string {
        let compressed = options && options.compressed ? options.compressed : true;

        return WIF.encode(this.network.wif, buffer, compressed);
    }
}
