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

            let networkClient = Networking.firstNetworkClient(coin);

            const connectionPromise = new Promise(resolve => {
                networkClient.getTracker().onConnect(() => resolve());
            });

            const disconectionPromise = new Promise((resolve) => {
                networkClient.getTracker().onDisconnect(() => resolve());
            });


            it(`Successful Connected`, async () => {
                try {
                    await connectionPromise;
                } finally {
                    networkClient.destruct();
                }
            }, 2000);


            it(`Successful Disconnected`, async () => {
                await disconectionPromise;
            }, 2000);
        }, 2000);
    });
});
