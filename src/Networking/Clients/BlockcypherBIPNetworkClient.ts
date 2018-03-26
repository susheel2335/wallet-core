import {each, map, orderBy} from 'lodash';
import Axios, {AxiosError, AxiosInstance} from 'axios';

import {Coin, Wallet, Constants} from "../../";
import {WalletTransaction} from "../../Wallet/Entity";
import {AdapterOptionInterface, Blockcypher} from '../Api';
import {wrapLimiterMethod} from '../Limmiters/Blockcypher';
import {NetworkClient} from './NetworkClient';

export default class BlockcypherBIPNetworkClient extends NetworkClient {
    protected client: AxiosInstance;

    constructor(coin: Coin.CoinInterface, options: AdapterOptionInterface) {
        super(coin, options);

        this.client = Axios.create({
            baseURL: this.getApiUrl(),
            timeout: 10000
        });
    }


    /**
     * @param {string} txid
     * @returns {WalletTransaction}
     */
    getTx(txid: string): Promise<Wallet.Entity.WalletTransaction | null> {
        const onRequestSuccess = (response) => {
            const tx: Blockcypher.Transaction = response.data;

            return Blockcypher.toWalletTx(tx, this.coin);
        };

        const onError = (error: AxiosError) => {
            if (error.response.status == 404) {
                return null;
            }

            throw error;
        };

        return wrapLimiterMethod(() => {
            return this.client
                .get('/txs/' + txid)
                .then(onRequestSuccess)
                .catch(onError);
        });
    }


    /**
     * @param {string} blockHash
     * @returns {Block}
     */
    getBlock(blockHash: string): Promise<Wallet.Entity.Block> {
        throw new Error('Must be implement');
    }


    /**
     * @param {Transaction} transaction
     * @returns {Promise<string>}
     */
    broadCastTransaction(transaction: Coin.Transaction.Transaction): Promise<string> {
        const requestData = {
            tx: transaction.toBuffer().toString('hex')
        };

        const onSuccess = (response) => {
            const tx: Blockcypher.Transaction = response.data;

            return tx.hash as string;
        };

        return wrapLimiterMethod(() => {
            return this.client
                .post('/txs/push', requestData)
                .then(onSuccess);
        });
    }


    /**
     * @param {string} address
     *
     * @returns {Promise<BIPTransaction[]>}
     */
    getAddressTxs(address: string): Promise<Wallet.Entity.BIPTransaction[]> {
        const onRequestSuccess = (response) => {
            const addressData: Blockcypher.AddressInfo = response.data;

            const txList: Wallet.Entity.BIPTransaction[] = [];
            const extractTxCallback = (tx: Blockcypher.Transaction) => {
                txList.push(Blockcypher.toWalletTx(tx, this.coin));
            };

            each(orderBy(addressData.txs, 'block_height', 'asc'), extractTxCallback);

            return txList;
        };

        return wrapLimiterMethod(() => {
            return this.client
                .get('/addrs/' + address + '/full')
                .then(onRequestSuccess);
        });
    }
}
