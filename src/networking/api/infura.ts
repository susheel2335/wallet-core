import BigNumber from 'bignumber.js';
import { map, forEach } from 'lodash';
import { Utils } from '../../utils';
import * as Coin from '../../coin';
import * as Wallet from '../../wallet';
import * as Constants from '../../constants';


export interface JsonRPCResponse {
    id: number;
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
    }
}


export interface Block {
    difficulty: string;
    extraData: string;
    gasLimit: string;
    gasUsed: string;
    hash: string;
    logsBloom: string;
    miner: string;      // Miner Address
    mixHash: string;
    nonce: string;
    number: string;
    parentHash: string;
    receiptsRoot: string;
    sha3Uncles: string;
    size: string;
    stateRoot: string;
    timestamp: string;
    totalDifficulty: string;
    transactions: Transaction[];
    transactionsRoot: string;
    uncles: string[];
}


export interface Transaction {
    blockHash?: string;
    blockNumber?: string;
    blockTime?: string;
    hash: string;
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    input: string;
    value: string;
    nonce: string;
    transactionIndex: string;
    r: string;
    s: string;
    v: string;
}

export interface TransactionReceipt {
    blockHash: string;
    blockNumber: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    from: string;
    gasUsed: string;
    logs: any[];
    logsBloom: string;
    status: string;
    to: string;
    transactionHash: string;
    transactionIndex: string;
}

/**
 * @param {Transaction} tx
 * @param {CoinInterface} coin
 * @param {number} blockTime
 *
 * @returns {CommonTransaction}
 */
export function toWalletTx(tx: Transaction, coin: Coin.CoinInterface, blockTime: number = undefined): Wallet.Entity.EtherTransaction {
    return {
        coin: coin.getUnit(),
        txid: tx.hash,

        blockTime: blockTime ? blockTime : tx.blockTime,
        blockHeight: new BigNumber(tx.blockNumber).toNumber(),

        scheme: Coin.TransactionScheme.FROM_TO,
        value: new BigNumber(tx.value).div(Constants.WEI_PER_COIN).toString(),
        gasPrice: new BigNumber(tx.gasPrice).div(Constants.WEI_PER_COIN).toString(),
        gasLimit: tx.gas,
        to: tx.to,
        from: tx.from,
        data: tx.input,
        nonce: new BigNumber(tx.nonce).toNumber(),
        r: tx.r,
        s: tx.s,
        v: tx.v,
    } as Wallet.Entity.EtherTransaction;
}


function transformUnit(unit: any) {
    if (typeof unit === 'undefined') {
        return undefined;
    }

    if (Number.isInteger(unit) || BigNumber.isBigNumber(unit)) {
        return Utils.numberToHex(unit);
    }

    if (Buffer.isBuffer(unit)) {
        return Utils.addHexPrefix((unit as Buffer).toString('hex'));
    }

    if (typeof unit === 'object') {
        let newUnit = {};

        forEach(unit, (v, k) => {
            v = transformUnit(v);
            if (!v) return;
            newUnit[k] = v;
        });

        return newUnit;
    }

    return unit;
}


export function transformRequestParams(params: any[]) {
    if (!params) {
        return undefined;
    }

    return map(params, transformUnit);
}