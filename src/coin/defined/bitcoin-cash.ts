import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import bchaddr from 'bchaddrjs';
import * as Key from '../key';
import { Unit } from '../entities';
import * as Constants from '../../constants';
import { BIPGenericCoin } from '../bip-generic-coin';

export default class BitcoinCash extends BIPGenericCoin {

    public getUnit(): Unit {
        return Unit.BCH;
    }

    public getName(): string {
        return 'Bitcoin Cash';
    }

    public getHDCoinType(): number {
        return 0;
    }

    public networkInfo(): BitcoinJS.Network {
        return {
            bip32: {
                'public': 0x0488b21e,
                'private': 0x0488ade4,
            },
            messagePrefix: '\x18Bitcoin Cash Signed Message:\n',
            pubKeyHash: 0x00,
            wif: 0x80,
            scriptHash: 0x05,
        };
    }

    public getNVersion(): number {
        return 2;
    }

    public get defaultFeePerKB(): BigNumber {
        return new BigNumber(8).times(1024).div(Constants.SATOSHI_PER_COIN);
    }

    protected buildHDKeyFormat(): Key.BIPKeyFormat {
        return new Key.BCHKeyFormat(this.networkInfo(), this.options);
    }

    public toOutputScript(address: string | Key.Address): Buffer {
        if (typeof address === 'string') {
            address = bchaddr.toLegacyAddress(address);
        }

        return super.toOutputScript(address);
    }

    public fromOutputScript(data: Buffer): string {
        const legacyAddress = super.fromOutputScript(data);

        return bchaddr.toCashAddress(legacyAddress);
    }
}
