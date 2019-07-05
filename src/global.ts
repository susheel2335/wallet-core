import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import * as Coin from './coin';
import * as Constants from './constants';

declare global {
    namespace plarkcore {
        type NewTxCallback = (tx: plarkcore.blockchain.CommonTransaction) => void;
        type NewBlockCallback = (block: blockchain.CommonBlock) => void;
        type BerryDebug = (message?: any, ...optionalParams: any[]) => void;

        type FeeType = 'low' | 'standard' | 'high';
        type FeeRecord = Record<FeeType, BigNumber>;
        type GasPrice = FeeRecord;

        type AdapterOption = {
            type: Constants.AdapterType;
            url: string;
            wsUrl?: string;

            [key: string]: any;
        };

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

        type CalculateMaxResponse = {
            coin: Coin.Unit;
            amount: BigNumber;
            fee: BigNumber;
            feeType: Constants.FeeTypes;

            [key: string]: any;
        };

        namespace eth {
            type EthTransactionRequestOptions = {
                data?: Buffer;
                gasLimit?: BigNumber;
                gasPrice?: BigNumber;
            }

            type EstimateGasRequestOptions = {
                to: Coin.Key.Address | string;
                from?: Coin.Key.Address | string;
                gas?: BigNumber;
                gasPrice?: BigNumber;
                value?: BigNumber;
                data?: Buffer;
            }

            type EtherTransaction = blockchain.CommonTransaction & {
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
        }

        /**
         * Namespace with BIP-related types
         */
        namespace bip {
            type Input = {
                prevTxid: string;
                prevOutIndex: number;
                scriptSig?: string;
                sequence: number;
                witness?: string[];
            }

            type Output = {
                value: string;
                scriptPubKey: string;

                // @TODO Need declare specific script types
                scriptType: Coin.ScriptType;

                // @TODO Need find why there is used an Array instead of primitive string
                addresses?: string[];
            }

            export type BIPTransaction = blockchain.CommonTransaction & {
                inputs: Input[];
                outputs: Output[];
                version: number;
                lockTime: number;
            }
        }

        /**
         * Blockchain information
         */
        namespace blockchain {
            type CommonBlock = {
                hash: string;
                height: number;
                time: number;
                txids: string[];
                original?: any;
            }

            type CommonTransaction = {
                txid: string;
                coin: Coin.Unit;
                blockHash?: string;
                blockHeight?: number;
                blockTime?: number;         // Unix Timestamp
                receiveTime?: number;
                scheme: Coin.TransactionScheme;
            }
        }
    }
}

export {};

