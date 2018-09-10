import BigNumber from 'bignumber.js';
import { Network } from 'bitcoinjs-lib';
import { Constants, Coin } from '../../';

import { BIPGenericCoin } from '../bip-generic-coin';

export class BitcoinTestnet extends BIPGenericCoin {

    public getUnit(): Coin.Unit {
        return Coin.Unit.BTCt;
    }

    public getName(): string {
        return 'Bitcoin Testnet';
    }

    public getHDCoinType(): number {
        return 1;
    }

    public networkInfo(): Network {
        return {
            bip32: {
                'public': 0x043587cf,
                'private': 0x04358394,
            },
            messagePrefix: '\x19Bitcoin Signed Message:\n',
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            bech32: 'tb',
        };
    }

    public get defaultFeePerByte(): BigNumber {
        return new BigNumber(8).div(Constants.SATOSHI_PER_COIN);
    }
}