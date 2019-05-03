import { forEach } from 'lodash';

import { Wallet } from '../../../';
import { Infura } from '../../api';
import { InfuraNetworkClient } from '../';
import { TrackerClient } from './tracker-client';
import Axios, { CancelTokenSource } from 'axios';

const NEW_BLOCK_CHECK_TIMEOUT = 15000;
const RECONNECT_TIMEOUT = 30000;
const CONNECTION_TIMEOUT = 60000 * 10;

export default class InfuraTrackerProvider extends TrackerClient<InfuraNetworkClient> {

    protected currentBlockHeight?: number;
    protected currentBlockTime?: number;

    protected enableBlockTracking: boolean = false;
    protected connected: boolean = false;
    protected blockTrackInterval?: any;

    protected cancelTokenSource: CancelTokenSource;

    public constructor(networkClient: InfuraNetworkClient) {
        super(networkClient);

        this.cancelTokenSource = Axios.CancelToken.source();
        this.startBlockTracking();
    }


    protected handleBlockError = (error): void => {
        if (this.blockTrackInterval) {
            clearInterval(this.blockTrackInterval);

            this.currentBlockHeight = undefined;
            this.currentBlockTime = undefined;
        }

        this.fireConnectionError(error);

        if (this.connected) {
            this.connected = false;
            this.fireDisconnect();
        }

        if (this.enableBlockTracking) {
            setTimeout(() => this.startBlockTracking.bind(this), RECONNECT_TIMEOUT);
        }

        throw error;
    };


    protected startBlockTracking() {
        this.enableBlockTracking = true;

        this.trackLastOrNextBlock().then(() => {
            this.blockTrackInterval = setInterval(
                () => this.trackLastOrNextBlock(),
                NEW_BLOCK_CHECK_TIMEOUT,
            );
        });
    }


    protected stopBlockTracking() {
        this.enableBlockTracking = false;
        clearInterval(this.blockTrackInterval);

        this.fireDisconnect();
    }


    protected fireNewBlock(block: Wallet.Entity.Block): boolean {
        this.currentBlockHeight = block.height;
        this.currentBlockTime = block.time;

        const originalResponse: Infura.Block = block.original;
        if (originalResponse) {
            const { addrs = [], callback = undefined } = this.addrTxEvents;
            forEach(originalResponse.transactions, (tx: Infura.Transaction) => {

                const needCallCallback =
                    (tx.to && this.isAddrTrack(tx.to))
                    || (tx.from && this.isAddrTrack(tx.from));

                if (needCallCallback && callback) {
                    const etherWalletTx = Infura.toWalletTx(tx, this.networkClient.getCoin(), block.time);
                    this.networkClient.checkAndMapTxReceipt(etherWalletTx).then(callback);
                }

                if (this.listenerCount(`tx.${tx.hash}`) > 0) {
                    this.fireTxidConfirmation(Infura.toWalletTx(tx, this.networkClient.getCoin(), block.time));
                }
            });
        }

        return super.fireNewBlock(block);
    }


    protected getCurrentBlockTime(): number {
        return this.currentBlockTime || 0;
    }


    protected async fireTxidConfirmation(tx: Wallet.Entity.EtherTransaction): Promise<void> {
        try {
            const rtx = await this.networkClient.checkAndMapTxReceipt(tx);
            await super.fireTxidConfirmation(rtx);
        } catch (e) {

        }
    }


    protected activateConnection() {
        if (!this.connected) {
            this.connected = true;
            this.fireConnect();
        }
    }


    protected async trackLastOrNextBlock(): Promise<Wallet.Entity.Block | void> {
        if (!this.enableBlockTracking) {
            return;
        }

        let blockHeight: string | number = 'latest';
        if (this.currentBlockHeight && (new Date().getTime() - this.getCurrentBlockTime() < CONNECTION_TIMEOUT)) {
            blockHeight = this.currentBlockHeight + 1;
        }

        try {
            const block: Wallet.Entity.Block | undefined = await this.networkClient.getBlockByNumber(
                blockHeight, {
                    cancelToken: this.cancelTokenSource.token,
                });

            this.activateConnection();

            if (!block) {
                return;
            }

            this.fireNewBlock(block);
            this.trackLastOrNextBlock();

            return block;
        } catch (error) {
            if (false === Axios.isCancel(error)) {
                this.debug(error.message);

                return;
            }

            this.handleBlockError(error);
        }
    }


    public destruct() {
        this.cancelTokenSource.cancel(`Destruct Infura block Tracker`);
        this.stopBlockTracking();
        super.destruct();
    }
}
