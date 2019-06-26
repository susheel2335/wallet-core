import { Coin, Networking, Wallet } from '../';

const coin = Coin.makeCoin(Coin.Unit.ETH);
const networkProvider = new Networking.NetworkProvider(coin);

const handleNewBlock = (block: Wallet.Entity.Block) => {
    console.log(`${coin.getUnit()} :: ${block.height} :: TX count: ${block.txids.length}`);
};


const tracker = networkProvider.createTracker();

tracker.onBlock(handleNewBlock);

tracker.onConnectionError((error) => {
    console.log("It's disconnection error!!!!");
});

tracker.onConnect(() => {
    console.log(`${coin.getUnit()} :: Connected!`);
});
