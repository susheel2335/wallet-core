import { Constants, Coin } from '../../';
import { Network } from 'bitcoinjs-lib';
import { BIPGenericCoin } from '../bip-generic-coin';
import BigNumber from 'bignumber.js';

export class Litecoin extends BIPGenericCoin {

    public getUnit(): Coin.Unit {
        return Coin.Unit.LTC;
    }

    public getName(): string {
        return 'Litecoin';
    }

    public getHDCoinType(): number {
        return 2;
    }

    public networkInfo(): Network {
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
