import { forEach, reduce, find } from 'lodash';
import { parse as parseUrl } from 'url';
import { Wallet, Debug } from '../../../';
import { InsightNetworkClient } from '../';
import { TrackerClient } from './tracker-client';

import io from 'socket.io-client';

export class InsightTrackerProvider extends TrackerClient<InsightNetworkClient> {

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

        setTimeout(() => this.createSocketConnection(), 1);
    }

    public destruct() {
        this.enableReconnect = false;
        this.__removeSocketConnection();

        super.destruct();
    }

    public createSocketConnection() {
        this.socket = io.connect(this.networkClient.getWSUrl(), {
            timeout: 1000,
            autoConnect: false,
            rejectUnauthorized: true,
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            this.debug('Socket connected!');

            setTimeout(() => {
                (!this.connected && this.socket) && this.fireConnect();
            }, 500);
        });

        this.socket.on('block', this.onHandleBlock);
        this.socket.on('tx', this.onHandleTransaction);

        this.socket.on('error', (error) => {
            this.debug(error);
            this.debug('Socket connection error');
            this.fireConnectionError(error);

            this.reconnectSocket();
        });

        this.socket.on('connect_timeout', () => {
            this.debug('Socket connection timeout');

            this.reconnectSocket();
        });

        this.socket.on('disconnect', () => {
            this.reconnectSocket();
        });

        this.socket.open();
    }

    protected reconnectSocket() {
        if (!this.enableReconnect) {
            return;
        }

        this.__removeSocketConnection();

        this.debug('Start reconnecting...');

        setTimeout(() => this.createSocketConnection(), 2000);
    }


    protected fireConnect(): boolean {
        if (!this.socket) {
            throw new Error('No socket connection for ' + this.networkClient.getWSUrl());
        }

        this.socket.emit('subscribe', 'inv');
        this.connected = true;

        return super.fireConnect();
    }


    protected fireNewBlock(block: Wallet.Entity.Block): boolean {
        forEach(block.txids, async (txid) => {
            if (this.listenerCount('tx.' + txid) === 0) return;

            const tx = await this.networkClient.getTx(txid);
            tx && this.fireTxidConfirmation(tx);
        });

        return super.fireNewBlock(block);
    }


    protected onHandleBlock = async (blockHash: string) => {
        try {
            const block: Wallet.Entity.Block = await this.networkClient.getBlock(blockHash);

            this.fireNewBlock(block);
        } catch (error) {
            throw new Error(
                `Error on handle block "${blockHash}" of "${this.networkClient.getCoin().getName()}":
                ${error.message}`,
            );
        }
    };


    protected onHandleTransaction = async (tx: any) => {
        const { callback, addrs } = this.addrTxEvents;
        if (callback && addrs.length) {
            const transactionAddrs = reduce(
                tx.vout,
                (list, vout) => [...list, ...Object.keys(vout)],
                [],
            );

            const addr = find(transactionAddrs, (addr) => this.isAddrTrack(addr));

            if (addr) {
                const responseTx: Wallet.Entity.BIPTransaction = await this.networkClient.getTx(tx.txid);
                callback(responseTx);
            }
        }
    };

    private __removeSocketConnection() {
        this.connected = false;
        if (typeof this.socket !== 'undefined') {
            this.socket.removeAllListeners();
            this.socket.close();

            delete this.socket;
        }
    }
}
