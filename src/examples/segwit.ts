import * as Coin from '../coin';
import * as Utils from '../utils';
import BitcoinJS from 'bitcoinjs-lib';

const buffer = Utils.hexToBuffer('0014cf60e9db2a932d47ed305151135b7a68bdeae44e');
const address = BitcoinJS.address.fromOutputScript(buffer);

console.log(address);


const addrInfo = BitcoinJS.address.fromBech32(address);
console.log(addrInfo);

// Coin.makeCoin(Coin.Unit.BTC)

//
// const bitcoinTest = Coin.makeCoin(Coin.Unit.BTCt);
// const outputBuffer = Buffer.from('6a4c50000169a7000162a5f3634f0df9a762c7edd065df13c9c439181f124d465a9f25fda48bb4515da746c3e4b798b98c793950e79d555b744bc306026737480de21bf91f79b938d5f7a50c6ded60629fff2a', 'hex');
//
// const type = BitcoinJS.script.classifyOutput(outputBuffer);
// const address = BitcoinJS.address.fromOutputScript(outputBuffer, bitcoinTest.networkInfo());
//
// console.log(type);
// console.log(address);
//
// console.log('');
//


//
// import BIP39 from 'bip39';
// import BitcoinJS from 'bitcoinjs-lib';
// import { Coin, Wallet, Utils } from '../';
//
// const mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
// const bufferSeed = BIP39.mnemonicToSeed(mnemonicSeed);
//
// const bitcoin = Coin.makeCoin(Coin.Unit.BTCt);
//
// const privateBitcoin = bitcoin.makePrivateFromSeed(bufferSeed);
//
// privateBitcoin.getWitnessAddress();
//