var BIP39 = require('bip39');
var data = require('./data.json');
var {Coin, Networking} = require('../index');

var phrase = data.phrase;
if (!phrase || phrase.split(' ').length !== 12) {
    console.error('No phrase');
    process.exit(1);
}

var seed = BIP39.mnemonicToSeed(phrase);

const coin = Coin.makeCoin(Coin.Unit.BTCt);
const networkProvider = new Networking.NetworkProvider(coin);
const tracker = networkProvider.createTracker();

const handleNewBlock = (block) => {
    console.log(`${coin.getUnit()} :: ${block.height} :: TX count: ${block.txids.length}`);
};

tracker.onBlock(handleNewBlock);

tracker.onAddrsTx([
    'mxNuCB7ogJjvVRSgZq9ZfYEYYmJ6HGQt2F',
    'mwA4zLGbVdZCUYVxsYQQCuMjfKQj84wMRr',
    'mqcMufz2jNZCP7XxRzXBATo2YfJPZ24vcV',
    'mxPhHJ8Vwny2AAPUqGrkdXGVC2Ar1reKef'
], (tx) => {
    console.log('New Transaction :: ' + tx.txid);
});

tracker.onConnectionError((error) => {
    console.log("Error on connected");
});

tracker.onConnect(() => {
    console.log(`${coin.getUnit()} :: Connected!`);
});
