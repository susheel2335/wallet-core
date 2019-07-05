import { forEach } from 'lodash';
import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { Coin, Utils, Constants } from '../../';

namespace blockbook {
    export type Info = {
        about: string;
        blocks: number;
        coin_name: string;
        network: string;
        testnet: boolean;
    };

    export type Input = {
        address: string;
        outputIndex: number;
        satoshis: number;
        script: string;
        sequence: number;
        txid: string;
    };

    export type Output = {
        address: string;
        satoshis: number;
        script: string;
    };


    export type Transaction = {
        blockTimestamp: number;
        feeSatoshis: number;
        hash: string;
        height: number;
        hex: string;
        inputSatoshis: number;
        inputs: Input[];
        locktime: number;
        outputSatoshis: number;
        outputs: Output[];
        version: number;
    };


    export type ExtendedTransaction = {
        addresses: Record<string, {
            inputIndexes: number[];
            outputIndexes: number[];
        }>;
        confirmations: number;
        satoshis: number;
        tx: Transaction
    };

    export type AddressInfo = {};

    export type Block = {
        page: number;
        totalPages: number;
        itemsOnPage: number;
        hash: string;
        previousblockhash: string;
        nextblockhash: string;
        height: number;
        confirmations: number;
        size: number;
        time: number;
        version: number;
        merkleroot: string;
        nonce: number;
        bits: string;
        difficulty: number;
        TxCount: number;

        txs: any[];
    };


    export function toWalletTx(tx: Transaction, coin: Coin.CoinInterface): plarkcore.bip.BIPTransaction {
        const txData: plarkcore.bip.BIPTransaction = {
            coin: coin.getUnit(),
            txid: tx.hash,
            scheme: Coin.TransactionScheme.INPUTS_OUTPUTS,
            blockHeight: tx.height > 0 ? tx.height : undefined,
            blockTime: tx.blockTimestamp * 1000,
            version: tx.version,
            lockTime: tx.locktime,
            inputs: [],
            outputs: [],
        } as plarkcore.bip.BIPTransaction;


        forEach(tx.inputs, (vin: Input) => {
            if (!vin.txid) return;

            txData.inputs.push({
                prevTxid: vin.txid,
                prevOutIndex: vin.outputIndex,
                scriptSig: vin.script ? vin.script : undefined,
                sequence: vin.sequence,
                witness: undefined,
            });
        });


        forEach(tx.outputs, (vout: Output) => {
            const buffer = Utils.hexToBuffer(vout.script);

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
                scriptPubKey: vout.script,
                scriptType: type,
                addresses: address ? [address] : [],
                value: new BigNumber(vout.satoshis)
                    .div(Constants.SATOSHI_PER_COIN)
                    .toString(10),
            });
        });

        return txData;
    }
}

export default blockbook;
