import assert from 'assert';
import { Coin, Networking } from '../../';

const coins = [
    Coin.Unit.BTC,
    Coin.Unit.BTCt,
    Coin.Unit.LTC,
    Coin.Unit.LTCt,
    Coin.Unit.DASH,
    // Coin.Unit.DASHt,
    Coin.Unit.ETH,
    Coin.Unit.ETHt,
];

describe('Tracker Connection', function () {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Tracker for ${coin.getUnit()}`, function () {
            let networkClient;
            let tracker;

            let connectionPromise;
            let disconectionPromise;

            before(function () {
                networkClient = Networking.firstNetworkClient(coin);
                tracker = networkClient.createTracker();

                connectionPromise = new Promise(resolve => {
                    tracker.onConnect(() => resolve());
                });

                disconectionPromise = new Promise(resolve => {
                    tracker.onDisconnect(() => resolve());
                });
            });

            after(function () {
                networkClient && networkClient.destruct();
            });

            it(`Successful Connected`, async function () {
                this.timeout(2000);

                try {
                    await connectionPromise;
                } catch (error) {
                    console.error(error.message);
                } finally {
                    tracker.destruct();
                    networkClient.destruct();
                }
            });


            it(`Successful Disconnected`, async function () {
                this.timeout(2000);
                await disconectionPromise;
            });
        });
    });
});
