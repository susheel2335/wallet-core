import assert from 'assert';
import { Coin, Networking } from '../../lib';

const coins = [
    // Coin.Unit.BTC,
    Coin.Unit.BTCt,
    Coin.Unit.LTC,
    Coin.Unit.LTCt,
    Coin.Unit.DASH,
    Coin.Unit.DASHt,
    Coin.Unit.ETH,
    Coin.Unit.ETHt,
];

describe('Test Tracker Connection', () => {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        it(`Connect Tracker for ${coin.getUnit()}`, async () => {
            await new Promise(resolve => {
                const networkProvider = new Networking.NetworkProvider(coin);

                networkProvider.getTracker().onConnect(() => {
                    networkProvider.destruct();
                    resolve();
                });
            });
        }, 2000);
    });
});
