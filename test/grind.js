var Coin = require('./lib').Coin;
var HD = require('./lib').HD;
var seed = require('./test/fixtures/seed').seed;

var coin = Coin.makeCoin(Coin.Unit.BTC);

for(var i = 0; i < 50; i++) {
    coin.makePrivateFromSeed(seed).deriveAddress(HD.BIP44.AddressType.RECEIVE, 0);
}
