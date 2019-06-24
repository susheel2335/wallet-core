import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import * as Constants from '../../constants';
import { Unit } from '../entities';
import { BIPGenericCoin } from '../bip-generic-coin';

export default class Litecoin extends BIPGenericCoin {

    public getUnit(): Unit {
        return Unit.LTC;
    }

    public getName(): string {
        return 'Litecoin';
    }

    public getHDCoinType(): number {
        return 2;
    }

    public networkInfo(): BitcoinJS.Network {
        return {
            bip32: {
                "public": 0x019da462,
                "private": 0x019d9cfe,
            },
            messagePrefix: '\x19Litecoin Signed Message:\n',
            pubKeyHash: 0x30,
            scriptHash: 0x32,
            wif: 0xb0,
            bech32: 'ltc',
        };
    }

    public get defaultFeePerByte(): BigNumber {
        return new BigNumber(200).div(Constants.SATOSHI_PER_COIN);
    }

    public get minFeePerByte(): BigNumber {
        return new BigNumber(100).div(Constants.SATOSHI_PER_COIN);
    }
}
