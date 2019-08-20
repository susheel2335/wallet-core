import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
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

    public get defaultFeePerByte(): BigNumber {
        return new BigNumber(8).div(Constants.SATOSHI_PER_COIN);
    }
}
