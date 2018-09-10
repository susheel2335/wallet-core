import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import { Constants, Coin } from '../../';
import { BIPGenericCoin } from '../bip-generic-coin';

export class DashTestnet extends BIPGenericCoin {

    public getUnit(): Coin.Unit {
        return Coin.Unit.DASHt;
    }

    public getName(): string {
        return 'Dash Testnet';
    }

    public getHDCoinType(): number {
        return 5;
    }

    public networkInfo(): BitcoinJS.Network {
        return {
            bip32: {
                'public': 0x043587cf,
                'private': 0x04358394,
            },
            messagePrefix: '\x19Dash Signed Message:\n',
            pubKeyHash: 0x8c,
            scriptHash: 0x13,
            wif: 0xef,
        };
    }

    public get defaultFeePerByte(): BigNumber {
        return new BigNumber(8).div(Constants.SATOSHI_PER_COIN);
    }
}
