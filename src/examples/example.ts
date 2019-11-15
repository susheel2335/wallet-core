import { forEach } from 'lodash';
import BIP39 from 'bip39';

import { Coin, Wallet, Networking } from '../';

type CoinInfo = {
    coin: Coin.CoinInterface,
};

const coins: CoinInfo[] = [
    {
        coin: Coin.makeCoin(Coin.Unit.ETH),
    },
];

const mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
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
        const tx: plarkcore.blockchain.CommonTransaction | undefined
            = await networkProvider.getTx(txid);

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

    console.log('Address balances: ');
    forEach(balance.addrBalances, (balance: Wallet.Entity.Balance, addr: string) => {
        console.log([
            `${addr}`,
            `Receive: ${balance.receive.toNumber()}`,
            `Unconfirmed: ${balance.unconfirmed.toNumber()}`,
            `Balance: ${balance.receive.minus(balance.spend).minus(balance.unconfirmed).toNumber()}`,
        ].join(' | '));
    });

    console.log('');
    console.log('Txs: ');
    forEach(balance.txBalances, (balance: Wallet.Entity.Balance, txid: string) => {
        console.log([
            `${txid}`,
            `Receive: ${balance.receive.toNumber()}`,
            `Spend: ${balance.spend.toNumber()}`,
        ].join(' | '));
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
};


coins.forEach(async (coinInfo: CoinInfo) => {
    const coinNetwork = Networking.createNetworkProvider(coinInfo.coin);

    const walletGenerator = Wallet.Generator.createGenerator(coinInfo.coin, bufferSeed, coinNetwork);
    const wdProvider: Wallet.Provider.WDProvider = await walletGenerator.fill();

    onWdCreated(wdProvider, coinInfo);
});