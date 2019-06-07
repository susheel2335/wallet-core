import { forEach, orderBy } from 'lodash';
import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import * as Coin from 'coin';
import { Wallet, Utils } from '../../';

export type Network = {
    info: {
        version: number;
        protocolversion: number;
        blocks: number;
        timeoffset: number;
        connections: number;
        proxy: string;
        difficulty: number;
        testnet: false;
        relayfee: number;
        errors: string;
        network: string;
    }
};


export type BlockchainInfo = {
    info: {
        version: number;
        protocolversion: number;
        blocks: number;
        timeoffset: number;
        connections: number;
        proxy: string;
        difficulty: number;
        testnet: boolean;
        relayfee: number;
        errors: string;
        network: 'livenet' | 'testnet';
    }
};

export type Input = {
    txid: string;
    vout: number;
    sequence: number;
    n: number;
    addr: string;
    valueSat: number;
    value: number;
    doubleSpentTxID?: string;
    scriptSig?: {
        asm: string;
        hex: string;
    };
    witness: string[];
};

export type Output = {
    value: string;
    n: number;
    scriptPubKey: {
        hex: string;
        asm: string;
        addresses: string[];
        type: string;
    },
    spentTxId?: string;
    spentIndex?: number;
    spentHeight?: number;
};

export type Transaction = {
    txid: string;
    version: number;
    locktime: number;
    vin: Input[];
    vout: Output[];
    blockhash: string;
    blockheight: number;
    confirmations: number;
    time: number;
    blocktime: number;
    valueOut: number;
    size: number;
    valueIn: number;
    fees: number;
};

export type AddressInfo = {
    addrStr: string;
    balance: number;
    balanceSat: number;
    totalReceived: number;
    totalReceivedSat: number;
    totalSent: number;
    totalSentSat: number;
    unconfirmedBalance: number;
    unconfirmedBalanceSat: number;
    unconfirmedTxApperances: number;
    txApperances: number;
    transactions: string[];
};

export type Block = {
    hash: string;
    size: number;
    height: number;
    version: number;
    merkleroot: string;
    tx: string[];
    time: number;
    nonce: number;
    bits: string;
    difficulty: number;
    chainwork: string;
    confirmations: number;
    previousblockhash: string;
    reward: number;
    isMainChain: true;
    poolInfo: any;
};

export function toWalletTx(tx: Transaction, coin: Coin.CoinInterface): Wallet.Entity.BIPTransaction {
    const txData: Wallet.Entity.BIPTransaction = {
        coin: coin.getUnit(),
        txid: tx.txid,
        blockHeight: (+tx.blockheight > 0) ? tx.blockheight : undefined,
        blockTime: tx.blocktime * 1000,
        scheme: Coin.TransactionScheme.INPUTS_OUTPUTS,
        version: tx.version,
        lockTime: tx.locktime,
        inputs: [],
        outputs: [],
    } as Wallet.Entity.BIPTransaction;

    forEach(orderBy(tx.vin, 'n', 'asc'), (vin: Input) => {
        if (!vin.txid) return;

        txData.inputs.push({
            prevTxid: vin.txid,
            prevOutIndex: vin.vout,
            scriptSig: vin.scriptSig ? vin.scriptSig.hex : undefined,
            sequence: vin.sequence,
            witness: vin.witness,
        });
    });

    forEach(orderBy(tx.vout, 'n', 'asc'), (vout: Output) => {
        const spk = vout.scriptPubKey;

        const buffer = Utils.hexToBuffer(spk.hex);

        const type = BitcoinJS.script.classifyOutput(buffer) as Coin.ScriptType;
        let address;
        try {
            address = BitcoinJS.address.fromOutputScript(
                buffer,
                (coin as Coin.BIPGenericCoin).networkInfo(),
            );
        } catch (e) {
        }

        txData.outputs.push({
            scriptPubKey: spk.hex,
            scriptType: type,
            addresses: address ? [address] : [],
            value: new BigNumber(vout.value).toString(10),
        });
    });

    return txData;
}
