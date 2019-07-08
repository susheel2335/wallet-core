import { forEach, map } from 'lodash';
import BigNumber from 'bignumber.js';
import BitcoinJS from 'bitcoinjs-lib';
import * as Coin from '../coin';
import * as Constants from '../constants';
import * as Entity from './entity';
import { INetworkProvider } from '../networking';
import { BalanceException } from './exceptions';
import { WDProvider } from './wd-provider';

export function calculateBalance(balance: Entity.WDBalance, withUnconfirmed = false): number {
    let totalBalance = new BigNumber(0);

    forEach(balance.addrBalances, (b: Entity.Balance) => {
        totalBalance = totalBalance.plus(b.receive).minus(b.spend);

        if (!withUnconfirmed) {
            totalBalance = totalBalance.minus(b.unconfirmed);
        }
    });

    return totalBalance.toNumber();
}

export function calculateTxBalance(balance: Entity.WDBalance, txid: string): number {
    const txBalance: Entity.Balance = balance.txBalances[txid];

    if (!txBalance) {
        throw new BalanceException(`Transaction with TXID '${txid}' not found`);
    }

    return txBalance.receive.minus(txBalance.spend).toNumber();
}

export function createWDProvider(walletData: Entity.WalletData, networkProvider: INetworkProvider): WDProvider {
    return new WDProvider(walletData, networkProvider);
}

export function coinTxToWalletTx(
    txid: string,
    coinTx: Coin.Transaction.Transaction,
    coin: Coin.CoinInterface,
): plarkcore.blockchain.CommonTransaction {

    if (false === coinTx.isSigned) {
        throw new Error('Transaction must be signed');
    }

    const walletTransaction: plarkcore.blockchain.CommonTransaction = {
        coin: coin.getUnit(),
        txid: txid,
        receiveTime: new Date().getTime(),
    } as plarkcore.blockchain.CommonTransaction;

    switch (coin.getTransactionScheme()) {
        case Coin.TransactionScheme.INPUTS_OUTPUTS: {
            return mapBIPTransaction(
                walletTransaction as plarkcore.bip.BIPTransaction,
                coinTx as Coin.Transaction.BIPTransaction,
                coin as Coin.BIPGenericCoin,
            );
        }

        case Coin.TransactionScheme.FROM_TO: {
            return mapEtherTransaction(
                walletTransaction as plarkcore.eth.EtherTransaction,
                coinTx as Coin.Transaction.EthereumTransaction,
                coin,
            );
        }
    }

    throw new Error('Invalid transaction scheme');
}

function mapBIPTransaction(
    walletTransaction: plarkcore.bip.BIPTransaction,
    coinTx: Coin.Transaction.BIPTransaction,
    coin: Coin.BIPGenericCoin,
): plarkcore.bip.BIPTransaction {

    walletTransaction.version = coinTx.version;
    walletTransaction.lockTime = coinTx.bitcoinJsTransaction.locktime;

    walletTransaction.inputs = map(coinTx.inputs, (input: BitcoinJS.In) => {
        return {
            prevTxid: (input.hash.reverse() as Buffer).toString('hex'),
            prevOutIndex: input.index,
            sequence: input.sequence,
            scriptSig: input.script.toString('hex'),
        } as plarkcore.bip.Input;
    });

    walletTransaction.outputs = map(coinTx.outputs, (output: BitcoinJS.Out) => {
        let address;
        try {
            address = BitcoinJS.address.fromOutputScript(output.script, coin.networkInfo());
        } catch (e) {
        }

        const scriptType = BitcoinJS.script.classifyOutput(output.script) as Coin.ScriptType;

        return {
            value: new BigNumber(output.value).div(Constants.SATOSHI_PER_COIN).toFixed(),
            scriptPubKey: output.script.toString('hex'),
            addresses: address ? [address] : [],
            scriptType: scriptType,
        } as plarkcore.bip.Output;
    });

    return walletTransaction;
}

function mapEtherTransaction(
    walletTransaction: plarkcore.eth.EtherTransaction,
    coinTx: Coin.Transaction.EthereumTransaction,
    coin: Coin.CoinInterface,
): plarkcore.eth.EtherTransaction {

    walletTransaction.from = coinTx.from.toString();
    walletTransaction.to = coinTx.to.toString();
    walletTransaction.value = coinTx.value.toString();
    walletTransaction.nonce = coinTx.ethereumTx.nonce;
    walletTransaction.data = coinTx.data.toString('hex');
    walletTransaction.r = coinTx.ethereumTx.r;
    walletTransaction.s = coinTx.ethereumTx.s;
    walletTransaction.v = coinTx.ethereumTx.v;
    walletTransaction.gasPrice = coinTx.gasPrice.toString();
    walletTransaction.gasLimit = coinTx.gasLimit.toString();

    return walletTransaction;
}
