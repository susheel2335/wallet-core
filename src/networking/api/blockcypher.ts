import { forEach } from 'lodash';
import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import * as Coin from '../../coin';
import * as Constants from '../../constants';
import { Utils } from '../../utils';

namespace blockcypher {
    export type Network = {
        name: string;
        height: number;
        hash: string;
        time: string; // DateTime
        latest_url: string;
        previous_hash: string;
        previous_url: string;
        peer_count: number;
        unconfirmed_count: number;
        high_fee_per_kb: number;
        medium_fee_per_kb: number;
        low_fee_per_kb: number;
        last_fork_height?: number;
        last_fork_hash?: string;
    };

    export type Block = {
        /**
         * The hash of the block; in Bitcoin,
         * the hashing function is SHA256(SHA256(block))
         */
        hash: string;

        /**
         * The depth of the block in the blockchain;
         * i.e., there are depth later blocks in its blockchain.
         */
        depth: number;

        /**
         * The height of the block in the blockchain;
         * i.e., there are height earlier blocks in its blockchain.
         */
        height: number;

        /**
         * The name of the blockchain represented,
         * in the form of $COIN.$CHAIN
         */
        chain: string;

        /**
         * Address of the peer that sent BlockCypher’s servers this block.
         */
        relayed_by: string;

        total: number;
        fees: number;
        ver: number;
        time: string; // DateTime
        received_time: string; // DateTime
        bits: number;
        nonce: number;
        n_tx: number;
        prev_block: string;
        mrkl_root: string;
        txids: string[];
        prev_block_url: string;
        tx_url: string;
    };

    export type Input = {
        prev_hash: string;
        output_index: number;
        script?: string;
        output_value: number;
        sequence: number;

        addresses?: string[];
        script_type: string;
        witness?: string[];
    };

    export type Output = {
        value: number;
        script: string;
        spent_by: string;
        addresses: string[];
        script_type: string;
    };

    export type Transaction = {
        block_hash: string;
        block_height: number;
        hash: string;
        addresses: string[];
        total: number;
        fees: number;
        size: number;
        preference: string;
        relayed_by: string;
        confirmed?: string; // DateTime
        receive_count?: string;
        received: string; // DateTime
        ver: number;
        lock_time: number;
        double_spend: boolean;
        vin_sz: number;
        vout_sz: number;
        confirmations: number;
        confidence: number;
        inputs: Input[];
        outputs: Output[];
    };

    export interface AddressInfo {
        address: string;
        total_received: number;
        total_sent: number;
        balance: number;
        unconfirmed_balance: number;
        final_balance: number;
        n_tx: number;
        unconfirmed_n_tx: number;
        final_n_tx: number;

        txs: Transaction[]
    }

    export function toWalletTx(tx: Transaction, coin: Coin.CoinInterface): plarkcore.bip.BIPTransaction {
        const txData: plarkcore.bip.BIPTransaction = {
            coin: coin.getUnit(),
            txid: tx.hash,
            blockHeight: (tx.block_height && tx.block_height > 0) ? tx.block_height : undefined,
            blockTime: tx.confirmed ? new Date(tx.confirmed).getTime() : undefined,
            scheme: Coin.TransactionScheme.INPUTS_OUTPUTS,
            version: tx.ver,
            lockTime: tx.lock_time,
            inputs: [],
            outputs: [],
        } as plarkcore.bip.BIPTransaction;

        forEach(tx.inputs, (vin: Input) => {
            txData.inputs.push({
                prevTxid: vin.prev_hash,
                prevOutIndex: vin.output_index,
                scriptSig: vin.script,
                sequence: vin.sequence,
                witness: vin.witness,
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
                value: new BigNumber(vout.value).div(Constants.SATOSHI_PER_COIN).toString(),
            });
        });

        return txData;
    }
}

export default blockcypher;
