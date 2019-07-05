import BIP39 from 'bip39';
import { Coin, Networking } from '../';

type CoinInfo = {
    coin: Coin.CoinInterface,
    address: string;
    addrs: string[];
};

const coin: CoinInfo = {
    coin: Coin.makeCoin(Coin.Unit.BTC),
    address: '187gUoBzNsikjYeoT6VKB6hsuyois7R1B8',
    addrs: ['187gUoBzNsikjYeoT6VKB6hsuyois7R1B8', '157pnkJkivyeibGuh6PW7C3HhtPd4BpQHm', '1BFuAKejNPRGGthcr5AtKFTUz3ofCoSBfy'],
};

const mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
const bufferSeed = BIP39.mnemonicToSeed(mnemonicSeed);

const client = Networking.firstNetworkClient(coin.coin);

(async () => {
    const txs = await client.getBulkAddrsTxs(coin.addrs);

    console.log(`Found ${txs.length} TXS`);

    const tracker = client.createTracker();
    tracker.onBlock((block) => console.log(block));
})();
