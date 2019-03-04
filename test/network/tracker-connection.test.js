import assert from 'assert';
import { Coin, Networking } from '../../lib';

const coins = [
    Coin.Unit.BTC,
    Coin.Unit.BTCt,
    Coin.Unit.LTC,
    Coin.Unit.LTCt,
    Coin.Unit.DASH,
    Coin.Unit.DASHt,
    Coin.Unit.ETH,
    Coin.Unit.ETHt,
];

describe('Test Tracker Connection', function () {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Tracker for ${coin.getUnit()}`, function () {

            let networkProvider = new Networking.NetworkProvider(coin);

            const connectionPromise = new Promise(resolve => {
                networkProvider.getTracker().onConnect(() => resolve());
            });

            it(`Successful Connected`, async () => {
                await connectionPromise;

                networkProvider.destruct();
            }, 2000);

        }, 2000);
    });
});
