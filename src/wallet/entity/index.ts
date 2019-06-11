import BigNumber from 'bignumber.js';
import { CoinUtxo } from 'coinselect';
import * as Coin from '../../coin';
import HD from '../../hd';


export type Block = {
    hash: string;
    height: number;
    time: number;
    txids: string[];
    original?: any;
};


export type WalletAddress = {
    address: string;
    type: HD.BIP44.AddressType;
    index: number;
    account?: number;
};


export type WalletTransaction = {
    txid: string;
    coin: Coin.Unit;
    blockHash?: string;
    blockHeight?: number;
    blockTime?: number;         // Unix Timestamp
    receiveTime?: number;
    scheme: Coin.TransactionScheme;
};


export type BIPInput = {
    prevTxid: string;
    prevOutIndex: number;
    scriptSig?: string;
    sequence: number;
    witness?: string[];
};


export type BIPOutput = {
    value: string;
    scriptPubKey: string;
    scriptType: Coin.ScriptType;  // @TODO Need declare specific script types
    addresses?: string[];         // @TODO Need find why there is used an Array instead of primitive string
};


export type BIPTransaction = WalletTransaction & {
    inputs: BIPInput[];
    outputs: BIPOutput[];
    version: number;
    lockTime: number;
}


export type EtherTransaction = WalletTransaction & {
    type: 'normal' | 'internal';
    to: string;
    from: string;
    value: string;
    nonce: number;
    data: string;
    gasPrice: string;
    gasLimit: string;
    gasUsed?: string;
    receiptStatus?: boolean;
    r?: string;
    s?: string;
    v?: string;
}


export type WalletData = {
    coin: Coin.Unit;
    accountIndex?: number;
    txs: Record<string, WalletTransaction>;
    addresses: WalletAddress[];
};


export type UnspentTXOutput = CoinUtxo & {
    txid: string;
    vout: number;
    addresses: string[];
    confirmed: boolean;
    prevScript: string;
    prevScriptType: Coin.ScriptType;
    witness?: string[];
};


export type Balance = {
    receive: BigNumber;
    spend: BigNumber;
    unconfirmed?: BigNumber;
};


export type WDBalance = {
    addrBalances: Record<string, Balance>;
    txBalances: Record<string, Balance>;
    utxo: UnspentTXOutput[];
};
