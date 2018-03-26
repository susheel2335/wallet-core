import {each} from 'lodash';

import {Wallet} from '../../../';
import {Infura} from '../../Api';
import {InfuraNetworkClient} from '../';
import {TrackerClient} from './';

const NEW_BLOCK_CHECK_TIMEOUT = 15000;
const RECONNECT_TIMEOUT = 30000;

export class InfuraTrackerProvider extends TrackerClient<InfuraNetworkClient> {

    protected currentBlockHeight: number;
    protected blockCheckTimeout;
    protected enableBlockTracking: boolean = false;
    protected connected: boolean = false;

    /**
     * @param {InfuraNetworkClient} networkClient
     */
    constructor(networkClient: InfuraNetworkClient) {
        super(networkClient);

        this.startBlockTracking();
    }

    handleBlockError = (error) => {
        if (this.blockCheckTimeout) {
            clearTimeout(this.blockCheckTimeout);
            this.currentBlockHeight = null;
        }

        this.fireConnectionError(error);

        if (this.connected) {
            this.connected = false;
            this.fireDisconnect();
        }

        setTimeout(() => {
            this.startBlockTracking();
        }, RECONNECT_TIMEOUT);

        throw error;
    };

    protected startBlockTracking() {

        this.enableBlockTracking = true;
        const handleResponse = (block) => {
            this.checkConnection();

            this.fireNewBlock(block);
            this.trackNextBlock();
        };

        this.networkClient
            .getBlockByNumber('latest')
            .then(handleResponse)
            .catch(this.handleBlockError);
    }

    /**
     * @param {Block} block
     */
    protected fireNewBlock(block: Wallet.Entity.Block): boolean {
        this.currentBlockHeight = block.height;

        const originalResponse: Infura.Block = block.original;
        if (originalResponse) {
            const {addrs = [], callback = null} = this.addrTxEvents;
            each(originalResponse.transactions, (tx: Infura.Transaction) => {

                if (this.isAddrTrack(tx.to) || this.isAddrTrack(tx.from)) {
                    if (callback) {
                        const etherWalletTx = Infura.toWalletTx(tx, this.networkClient.getCoin(), block.time);
                        this.networkClient.checkAndMapTxReceipt(etherWalletTx).then(callback);
                    }
                }

                if (this.listenerCount(`tx.${tx.hash}`) > 0) {
                    this.fireTxidConfirmation(Infura.toWalletTx(tx, this.networkClient.getCoin(), block.time));
                }
            });
        }

        return super.fireNewBlock(block);
    }

    /**
     * @param {WalletTransaction} tx
     */
    protected fireTxidConfirmation(tx: Wallet.Entity.EtherTransaction): boolean {
        this.networkClient
            .checkAndMapTxReceipt(tx)
            .then(rtx => super.fireTxidConfirmation(rtx));

        return true;
    }

    protected checkConnection() {
        if (!this.connected) {
            this.connected = true;
            this.fireConnect();
        }
    }

    protected trackNextBlock() {
        if (!this.enableBlockTracking) {
            return;
        }

        const handleResponse = (block: Wallet.Entity.Block = null) => {
            if (block) {
                this.fireNewBlock(block);
                this.trackNextBlock();
                return;
            }

            this.blockCheckTimeout = setTimeout(() => {
                this.trackNextBlock();
            }, NEW_BLOCK_CHECK_TIMEOUT);
        };

        this.networkClient
            .getBlockByNumber(this.currentBlockHeight ? this.currentBlockHeight + 1 : 'latest')
            .then(handleResponse)
            .catch(this.handleBlockError);
    }

    destruct() {
        this.enableBlockTracking = false;

        if (this.blockCheckTimeout) {
            clearTimeout(this.blockCheckTimeout);
        }

        super.destruct();
    }

}
