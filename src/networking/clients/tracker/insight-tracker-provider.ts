import { forEach, reduce, find } from 'lodash';
import { parse as parseUrl } from 'url';
import { Wallet, Debug } from '../../../';
import { InsightNetworkClient } from '../';
import { TrackerClient } from './tracker-client';

import io from 'socket.io-client';

export default class InsightTrackerProvider extends TrackerClient<InsightNetworkClient> {
    public socket: SocketIOClient.Socket;
    public connected: boolean = false;
    public enableReconnect: boolean = true;
    public debug: any;

    /**
     * @param {InsightNetworkClient} networkClient
     */
    public constructor(networkClient: InsightNetworkClient) {
        super(networkClient);

        const wsUrl = parseUrl(this.networkClient.getWSUrl());
        this.debug = Debug.create('SOCKET:' + wsUrl.host);

        this.socket = io.connect(this.networkClient.getWSUrl(), {
            timeout: 1000,
            autoConnect: false,
            rejectUnauthorized: true,
            transports: ['websocket'],
        });

        this._openSocketConnection();
    }

    public destruct() {
        this.enableReconnect = false;
        super.destruct();

        this.__removeSocketConnection();
    }

    protected _openSocketConnection() {
        this.socket.on('block', this.__onHandleBlock);
        this.socket.on('tx', this.__onHandleTransaction);

        this.socket.once('connect', () => {
            this.debug('Socket connected!');

            if (this.socket.connected) {
                this.fireConnect();
            } else {
                this.__reconnectSocket();
            }
        });

        this.socket.once('error', (error) => {
            this.debug(error);
            this.debug('Socket connection error');
            this.fireConnectionError(error);

            this.__reconnectSocket();
        });

        this.socket.once('connect_timeout', () => {
            this.debug('Socket connection timeout');

            this.__reconnectSocket();
        });

        this.socket.once('disconnect', () => {
            this.fireDisconnect();

            this.__reconnectSocket();
        });

        this.socket.open();
    }

    protected fireConnect(): boolean {
        if (!this.socket.connected) {
            throw new Error('No socket connection for ' + this.networkClient.getWSUrl());
        }

        this.socket.emit('subscribe', 'inv');
        this.connected = true;

        return super.fireConnect();
    }

    protected fireNewBlock(block: plarkcore.blockchain.CommonBlock): boolean {
        forEach(block.txids, async (txid) => {
            if (this.listenerCount('tx.' + txid) === 0) return;

            const tx = await this.networkClient.getTx(txid);
            tx && this.fireTxidConfirmation(tx);
        });

        return super.fireNewBlock(block);
    }

    private __onHandleBlock = async (blockHash: string) => {
        try {
            const block: plarkcore.blockchain.CommonBlock = await this.networkClient.getBlock(blockHash);

            this.fireNewBlock(block);
        } catch (error) {
            throw new Error(
                `Error on handle block "${blockHash}" of "${this.networkClient.getCoin().getName()}":
                ${error.message}`,
            );
        }
    };

    private __onHandleTransaction = async (tx: any) => {
        const { callback, addrs } = this.addrTxEvents;
        if (!callback || addrs.length === 0) {
            return;
        }

        const transactionAddrs = reduce(
            tx.vout,
            (list, vout) => [...list, ...Object.keys(vout)],
            [],
        );

        const addr = find(transactionAddrs, (addr) => this.isAddrTrack(addr));

        if (addr) {
            const responseTx: plarkcore.bip.BIPTransaction = await this.networkClient.getTx(tx.txid);
            callback(responseTx);
        }
    };

    private __reconnectSocket() {
        if (!this.enableReconnect) {
            return;
        }

        this.__removeSocketConnection();

        setTimeout(() => this._openSocketConnection(), 2000);

        this.debug('Start reconnecting...');
    }

    private __removeSocketConnection() {
        this.connected = false;

        this.socket.removeAllListeners();
        this.socket.once('disconnect', () => {
            this.fireDisconnect();
        });

        this.socket.disconnect();
    }
}
