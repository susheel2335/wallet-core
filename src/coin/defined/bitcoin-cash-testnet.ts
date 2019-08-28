import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import { Unit } from '../entities';
import * as Constants from '../../constants';
import { BIPGenericCoin } from '../bip-generic-coin';

export default class BitcoinCashTestnet extends BIPGenericCoin {

    public getUnit(): Unit {
        return Unit.BCH;
    }

    public getName(): string {
        return 'Bitcoin Cash Testnet';
    }

    public getHDCoinType(): number {
        return 0;
    }

    public networkInfo(): BitcoinJS.Network {
        return {
            bip32: {
                'public': 0x043587cf,
                'private': 0x04358394,
            },
            messagePrefix: '\x18Bitcoin Cash Signed Message:\n',
            pubKeyHash: 0x6f,
            wif: 0xef,
            scriptHash: 0xc4,
        };
    }

    public get defaultFeePerKB(): BigNumber {
        return new BigNumber(8).times(1024).div(Constants.SATOSHI_PER_COIN);
    }
}
