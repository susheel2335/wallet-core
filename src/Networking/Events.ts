import {Wallet} from "../";

declare type NewTxCallback = (tx: Wallet.Entity.WalletTransaction) => void;
declare type NewBlockCallback = (block: Wallet.Entity.Block) => void;

export {
    NewTxCallback,
    NewBlockCallback
}