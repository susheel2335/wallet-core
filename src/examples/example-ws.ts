import { Coin, Networking, Wallet } from '../';

const coin = Coin.makeCoin(Coin.Unit.ETH);
const networkProvider = new Networking.NetworkProvider(coin);

const handleNewBlock = (block: Wallet.Entity.Block) => {
    console.log(`${coin.getUnit()} :: ${block.height} :: TX count: ${block.txids.length}`);
};

networkProvider.onNewBlock(handleNewBlock);

networkProvider.getTracker().onConnectionError((error) => {
    console.log("It's disconnection error!!!!");
});

networkProvider.getTracker().onConnect(() => {
    console.log(`${coin.getUnit()} :: Connected!`);
});
