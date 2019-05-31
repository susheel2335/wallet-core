import * as Wallet from './wallet';
import * as Coin from './coin';
import BigNumber from 'bignumber.js';

declare global {
    namespace plarkcore {
        type NewTxCallback = (tx: Wallet.Entity.WalletTransaction) => void;
        type NewBlockCallback = (block: Wallet.Entity.Block) => void;

        type BlockchainInfo = {
            blockHeight: number;
            difficulty: number;
            testnet: boolean;
            network: string;
        };


        namespace eth {
            type EthTransactionRequestOptions = {
                data?: Buffer;
                gasLimit?: BigNumber;
                gasPrice?: BigNumber;
            };

            type EstimateGasRequestOptions = {
                to: Coin.Key.Address | string;
                from?: Coin.Key.Address | string;
                gas?: BigNumber;
                gasPrice?: BigNumber;
                value?: BigNumber;
                data?: Buffer;
            };
        }


        namespace bip {

        }
    }
}

export {};

