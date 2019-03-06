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

describe('Test Network Adapter', function () {
    coins.map((coinUnit) => {
        const coin = Coin.makeCoin(coinUnit);

        describe(`Tracker for ${coin.getUnit()}`, function () {

            let networkClient = Networking.firstNetworkClient(coin);

            it('Get Info', async () => {
                try {
                    const info = await networkClient.getInfo();

                    assert.ok(info.blockHeight, 'Not found blockHeight in "info"');
                } finally {
                    networkClient.destruct();
                }
            }, 2000);

        }, 2000);
    });
});
