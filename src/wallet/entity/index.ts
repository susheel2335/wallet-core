import BigNumber from 'bignumber.js';
import { CoinUtxo } from 'coinselect';
import * as Coin from '../../coin';
import HD from '../../hd';

/** @deprecated */
export type WalletTransaction = plarkcore.blockchain.CommonTransaction;

/** @deprecated */
export type EtherTransaction = plarkcore.eth.EtherTransaction;

export type WalletAddress = {
    address: string;
    type: HD.BIP44.AddressType;
    index: number;
    account?: number;
}

export type WalletData = {
    coin: Coin.Unit;
    accountIndex?: number;
    txs: Record<string, plarkcore.blockchain.CommonTransaction>;
    addresses: WalletAddress[];
}

export type UnspentTXOutput = CoinUtxo & {
    txid: string;
    vout: number;
    addresses: string[];
    confirmed: boolean;
    prevScript: string;
    prevScriptType: Coin.ScriptType;
    witness?: string[];
}

export type Balance = {
    receive: BigNumber;
    spend: BigNumber;
    unconfirmed?: BigNumber;
}

export type TransactionBalance = Balance & {
    fee: BigNumber;
}

export type WDBalance = {
    addrBalances: Record<string, Balance>;
    txBalances: Record<string, TransactionBalance>;
    utxo: UnspentTXOutput[];
}
