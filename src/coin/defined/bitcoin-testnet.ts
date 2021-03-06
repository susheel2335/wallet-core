import BigNumber from 'bignumber.js';
import { Network } from 'bitcoinjs-lib';
import * as Constants from '../../constants';
import { Unit } from '../entities';
import { BIPGenericCoin } from '../bip-generic-coin';

export default class BitcoinTestnet extends BIPGenericCoin {

    public getUnit(): Unit {
        return Unit.BTCt;
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
            wif: 0xef,
            scriptHash: 0xc4,
            bech32: 'tb',
        };
    }

    public get defaultFeePerKB(): BigNumber {
        return new BigNumber(8).times(1024).div(Constants.SATOSHI_PER_COIN);
    }
}