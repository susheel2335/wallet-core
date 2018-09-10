import { forEach } from 'lodash';
import BIP39 from 'bip39';
import BigNumber from 'bignumber.js';

import { Coin, Wallet } from '../';

type CoinInfo = {
    coin: Coin.CoinInterface,
    address: string;
};

const coins: CoinInfo[] = [
    // {
    //     coin: Coin.makeCoin(Coin.Unit.ETHt),
    //     address: '0x6a42b86469B9c3Df1e1De589bd1741B81a5A5fAF'
    // },
    // {
    //     coin: Coin.makeCoin(Coin.Unit.BTC),
    //     address: '15Wmq5V7ojGWCTWtjdWKsJCQB29gTB6VMa'
    // },
    {
        coin: Coin.makeCoin(Coin.Unit.BTCt),
        address: 'mm5GgtNrzXKE7y8LZhtdvX6uhuTmWL12eZ',
    },
    // {
    //     coin: Coin.makeCoin(Coin.Unit.DASH),
    //     address: 'XdYysbHbuV9tMg31NvE7DnzoySvoeZGmor'
    // },
    // {
    //     coin: Coin.makeCoin(Coin.Unit.DASHt),
    //     address: 'yjYxawxUJCDVmKKkKTCVbkT6ca2zWL28vz'
    // }
];

const oldSeed = 'honey relief scale kite dose lyrics they middle globe exhaust smooth galaxy ' +
    'horror ensure grape way gift embody spring cupboard horror hurt image swift';

const mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
// const mnemonicSeed = 'flag output rich laptop hub lift list horror enjoy topic sister lab';
const bufferSeed = BIP39.mnemonicToSeed(mnemonicSeed);


async function onWdCreated(wdProvider: Wallet.Provider.WDProvider, coinInfo: CoinInfo) {

    wdProvider.onChange((newWalletData) => {
        console.log("Address count: ", newWalletData.addresses.length);
    });

    const privateProvider = wdProvider.getPrivate(bufferSeed);
    const networkProvider = wdProvider.getNetworkProvider();
    const balance: Wallet.Entity.WDBalance = wdProvider.balance;

    const extractTx = async (txid: string) => {
        console.log('Extracting ' + txid + ' ... ');
        const tx: Wallet.Entity.WalletTransaction | undefined = await networkProvider.getTx(txid);

        if (!tx) {
            setTimeout(() => {
                extractTx(txid);
            }, 1000);

            return;
        }

        console.log('------------------------------------------------------------------');
        console.log('- TX at network! -------------------------------------------------');
        console.log(tx);
        console.log('------------------------------------------------------------------');
        console.log('');
    };

    forEach(wdProvider.address.list(), (addr: Wallet.Entity.WalletAddress) => {
        console.log(
            "Address: %s / Index: %s / Type: %s",
            addr.address,
            addr.index,
            addr.type,
        );
    });

    console.log('Addrs: ');
    forEach(balance.addrBalances, (balance: Wallet.Entity.Balance, addr: string) => {
        console.log(
            `${addr}: ${balance.receive.toNumber()} > ${balance.unconfirmed.toNumber()} > ${balance.receive.minus(balance.spend).minus(balance.unconfirmed).toNumber()}`,
        );
    });

    console.log('');
    console.log('Txs: ');
    forEach(balance.txBalances, (balance: Wallet.Entity.Balance, txid: string) => {
        console.log(`${txid}: ${balance.receive.toNumber()} - ${balance.spend.toNumber()}`);
    });
    console.log('');

    const resolveNewTransaction = async (transaction: Coin.Transaction.BIPTransaction) => {
        console.log();
        console.log('------------------------------------------------------------------');
        console.log(transaction.toBuffer().toString('hex'));
        console.log('');
        console.log('------------------------------------------------------------------');

        try {
            const txid: string = await privateProvider.broadcastTransaction(transaction);
            console.log(txid);
            extractTx(txid);

        } catch (error) {
            console.error(error.message);
        }

        console.log('------------------------------------------------------------------');
        console.log('');
    };

    try {
        const address = coinInfo.coin.getKeyFormat().parseAddress(coinInfo.address);

        const fee: BigNumber = await privateProvider.calculateFee(
            new BigNumber(0.001),
            address,
            Coin.FeeTypes.Low,
        );

        const tx = await privateProvider.createTransaction(address, new BigNumber(0.5), Coin.FeeTypes.Low);

        console.log('Fee: ', fee.toFixed());
    } catch (error) {
        console.error(`ERROR - ${error.message}`);
        console.log('');
        console.log('');
        console.log('');
    }
};


coins.forEach(async (coinInfo: CoinInfo) => {
    const walletGenerator = Wallet.Generator.createGenerator(coinInfo.coin, bufferSeed);
    const wdProvider: Wallet.Provider.WDProvider = await walletGenerator.fill();

    onWdCreated(wdProvider, coinInfo);
});