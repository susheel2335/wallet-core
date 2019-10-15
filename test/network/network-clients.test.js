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

describe('Network Adapter', function () {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Tracker for ${coin.getUnit()}`, function () {
            let networkClient;

            before(function () {
                networkClient = Networking.firstNetworkClient(coin);
            });

            after(function () {
                networkClient && networkClient.destruct();
            });

            it('Get Info', async function () {
                this.timeout(3000);

                const info = await networkClient.getInfo();
                assert.ok(info.blockHeight, 'Not found blockHeight in "info"');
            });

        }, 3000);
    });
});
