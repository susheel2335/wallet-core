import BigNumber from 'bignumber.js';
import { Network } from 'bitcoinjs-lib';
import { Constants, Coin } from '../../';
import { BIPGenericCoin } from '../bip-generic-coin';

export class Dash extends BIPGenericCoin {

    public getUnit(): Coin.Unit {
        return Coin.Unit.DASH;
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

    public get defaultFeePerByte(): BigNumber {
        return new BigNumber(8).div(Constants.SATOSHI_PER_COIN);
    }

    public get minFeePerByte(): BigNumber {
        return new BigNumber(1).div(Constants.SATOSHI_PER_COIN);
    }
}
