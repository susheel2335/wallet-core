import * as Wallet from './wallet';

declare global {
    namespace plarkcore {
        type NewTxCallback = (tx: Wallet.Entity.WalletTransaction) => void;
        type NewBlockCallback = (block: Wallet.Entity.Block) => void;
    }
}
