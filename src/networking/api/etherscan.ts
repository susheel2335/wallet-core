import BigNumber from 'bignumber.js';
import { Coin, Constants, Wallet } from '../../';

namespace etherscan {
    export interface CommonTransaction {
        blockNumber: string | number;
        timeStamp: string | number;
        hash: string;

        from: string;
        to: string;

        value: string | number;
        gas: string | number;

        input: string;
    }

    export interface Transaction extends CommonTransaction {
        transactionIndex: string | number;
        nonce: string | number;
        blockHash: string;
        gasPrice: string | number;
        isError: string;
        txreceipt_status: string;

        contractAddress: string;
        cumulativeGasUsed: string | number;
        gasUsed: string | number;
        confirmations: string | number;
    }

    export interface InternalTransaction extends CommonTransaction {
        contractAddress: string;
        type: string;

        gasUsed: string | number;
        traceId: string | number;
        isError: string | number;
        errCode: string | number;
    }

    export interface AddressInfo {
    }

    /**
     * @param {CoinInterface} coin
     * @param {Transaction} tx
     * @returns {EtherTransaction}
     */
    export function toWalletTx(coin: Coin.CoinInterface, tx: Transaction): Wallet.Entity.EtherTransaction {
        const txResult = {
            type: 'normal',
            coin: coin.getUnit(),
            txid: tx.hash,
            scheme: Coin.TransactionScheme.FROM_TO,
            value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
            gasPrice: new BigNumber(tx.gasPrice).div(Constants.WEI_PER_COIN).toString(),
            gasLimit: tx.gas,
            to: tx.to,
            from: tx.from,
            data: tx.input,
            nonce: tx.nonce,
        } as Wallet.Entity.EtherTransaction;

        if (tx.blockNumber) {
            txResult.blockHeight = new BigNumber(tx.blockNumber).toNumber();
            txResult.blockTime = new BigNumber(tx.timeStamp).times(1000).toNumber();
            txResult.receiptStatus = !!(new BigNumber(tx.txreceipt_status).toNumber());
            txResult.gasUsed = new BigNumber(tx.gasUsed).toString();
        }

        return txResult;
    }


    export function internalToWalletTx(coin: Coin.CoinInterface, tx: InternalTransaction): Wallet.Entity.EtherTransaction {
        const txResult = {
            coin: coin.getUnit(),
            type: 'internal',
            txid: tx.hash,
            scheme: Coin.TransactionScheme.FROM_TO,
            value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
            gasLimit: tx.gas,
            to: tx.to,
            from: tx.from,
            data: tx.input,
        } as Wallet.Entity.EtherTransaction;

        if (tx.blockNumber) {
            txResult.blockHeight = new BigNumber(tx.blockNumber).toNumber();
            txResult.blockTime = new BigNumber(tx.timeStamp).times(1000).toNumber();
            txResult.receiptStatus = !tx.errCode;
            txResult.gasUsed = new BigNumber(tx.gasUsed).toString();
        }

        return txResult;
    }
}

export default etherscan;
