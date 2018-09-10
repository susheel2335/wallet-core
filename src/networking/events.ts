import { Wallet } from '../';

export declare type NewTxCallback = (tx: Wallet.Entity.WalletTransaction) => void;
export declare type NewBlockCallback = (block: Wallet.Entity.Block) => void;
