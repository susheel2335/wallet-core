import { Coin, Networking, Debug } from '../';
import BIP39 from 'bip39';

const coin = Coin.makeCoin(Coin.Unit.LTC);
const mnemonicSeed = 'forward farm embrace mask skull speed cute noise pizza vendor moral harbor';
const debug = Debug.create('test-pubkey');
const networkProvider = new Networking.NetworkProvider(coin);

const bufferSeed = BIP39.mnemonicToSeed(mnemonicSeed);

const privateCoin = coin.makePrivateFromSeed(bufferSeed);
let i = 0;
for (i; i < 20; i++) {
    const addr = privateCoin.derive(i);
    console.log("Address %s", addr.getPublicKey().toAddress(Coin.Key.AddressFormat.BECH32).toString());
}
