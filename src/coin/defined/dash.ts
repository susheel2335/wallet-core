import BigNumber from 'bignumber.js';
import { Network } from 'bitcoinjs-lib';
import * as Constants from '../../constants';
import { Unit } from '../entities';
import { BIPGenericCoin } from '../bip-generic-coin';

export default class Dash extends BIPGenericCoin {

    public getUnit(): Unit {
        return Unit.DASH;
    }

    public getName(): string {
        return 'Dash';
    }

    public getHDCoinType(): number {
        return 5;
    }

    public networkInfo(): Network {
        return {
            bip32: {
                'public': 0x0488b21e,
                'private': 0x0288ade4,
            },
            messagePrefix: '\x19Dash Signed Message:\n',
            pubKeyHash: 76,
            scriptHash: 16,
            wif: 204,
        };
    }

    public get defaultFeePerKB(): BigNumber {
        return new BigNumber(8).times(1024).div(Constants.SATOSHI_PER_COIN);
    }

    public get minFeePerKB(): BigNumber {
        return new BigNumber(1).times(1024).div(Constants.SATOSHI_PER_COIN);
    }
}
