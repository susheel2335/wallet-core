import assert from 'assert';
import { Coin, Networking } from '../../lib';

const coins = [
    // Coin.Unit.BTC,
    // Coin.Unit.BTCt,
    // Coin.Unit.LTC,
    // Coin.Unit.LTCt,
    // Coin.Unit.DASH,
    // Coin.Unit.DASHt,
    // Coin.Unit.ETH,
    Coin.Unit.ETHt,
];

describe('Tracker Connection', function () {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Tracker for ${coin.getUnit()}`, function () {

            let networkClient = Networking.firstNetworkClient(coin);
            const tracker = networkClient.getTracker();

            const connectionPromise = new Promise(resolve => {
                tracker.onConnect(() => resolve());
            });

            const disconectionPromise = new Promise((resolve) => {
                tracker.onDisconnect(() => resolve());
            });


            it(`Successful Connected`, async function () {
                this.timeout(2000);

                try {
                    await connectionPromise;
                } finally {
                    // networkClient.destruct();
                }
            });


            it(`Successful Disconnected`, async function () {
                this.timeout(2000);
                await disconectionPromise;
            });
        });
    });
});
