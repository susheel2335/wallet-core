import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import * as Constants from './constants';
import * as Wallet from './wallet';
import * as Coin from './coin';

declare global {
    namespace plarkcore {
        type NewTxCallback = (tx: Wallet.Entity.WalletTransaction) => void;
        type NewBlockCallback = (block: Wallet.Entity.Block) => void;

        interface Destructible {
            destruct(): void;
        }

        interface ITrackerClient extends Destructible, EventEmitter {
            start(): Promise<void>;

            stop(): void;

            isStated(): boolean;

            onConnect(callback): ITrackerClient;

            onDisconnect(callback: (...args: any[]) => void): ITrackerClient;

            onBlock(callback: NewBlockCallback): ITrackerClient;

            onAddrsTx(addrs: string[], callback: NewTxCallback): ITrackerClient;

            onTransactionConfirm(txid: string, callback: NewTxCallback): ITrackerClient;

            onConnectionError(callback: (...args: any[]) => void): ITrackerClient;

            isAddrTrack(addr: string | Buffer): boolean;
        }


        type BlockchainInfo = {
            blockHeight: number;
            difficulty: number;
            testnet: boolean;
            network: string;
        };

        type CalculateFeeResponse = {
            coin: Coin.Unit;
            fee: BigNumber;
            feeType: Constants.FeeTypes;

            [key: string]: any;
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

