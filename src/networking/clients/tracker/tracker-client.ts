import { map, find } from 'lodash';
import { EventEmitter } from 'events';
import { Wallet, Debug } from '../../../';
import { INetworkClient } from '../';

export enum TrackerEvent {
    Connect = 'connect',
    Disconnect = 'disconnect',
    ConnectionError = 'connection_error',
    Error = 'error',
    Block = 'block',
    Tx = 'tx'
}

export interface IAddressTrackEvent {
    addrs: Buffer[];
    callback?: plarkcore.NewTxCallback;
}

export class TrackerClient<T extends INetworkClient> extends EventEmitter implements plarkcore.ITrackerClient {
    protected debug: debug.IDebugger;
    protected isStarted: boolean;
    protected readonly networkClient: T;
    protected addrTxEvents: IAddressTrackEvent = {
        addrs: [],
        callback: undefined,
    };

    /**
     * TrackerClient constructor
     *
     * @param {INetworkClient}      networkClient
     */
    public constructor(networkClient: T) {
        super();

        this.isStarted = false;
        this.networkClient = networkClient;
        this.debug = Debug.create('TRACKER_CLIENT::' + this.networkClient.getCoin().getUnit().toString());
    }

    /**
     * Return info whether TrackerClient is started or not
     *
     * @return {boolean}
     */
    public isStated(): boolean {
        return this.isStarted;
    }

    /**
     * Function to start Track blockchain
     *
     * @return {Promise<void>}
     */
    public async start(): Promise<void> {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;
    }

    /**
     * Function to stop Track blockchain
     *
     * @return {void}
     */
    public stop(): void {
        if (!this.isStarted) {
            return;
        }

        this.isStarted = false;
    }

    public onConnect(callback): plarkcore.ITrackerClient {
        this.on(TrackerEvent.Connect, callback);

        return this;
    }

    public onDisconnect(callback): plarkcore.ITrackerClient {
        this.on(TrackerEvent.Disconnect, callback);

        return this;
    }

    public onConnectionError(callback): plarkcore.ITrackerClient {
        this.on(TrackerEvent.ConnectionError, callback);

        return this;
    }

    public onBlock(callback: plarkcore.NewBlockCallback): plarkcore.ITrackerClient {
        this.on(TrackerEvent.Block, callback);

        return this;
    }

    public onTransactionConfirm(txid: string, callback: plarkcore.NewTxCallback): plarkcore.ITrackerClient {
        this.once(`tx.${txid}`, callback);

        return this;
    }

    public onAddrsTx(addrs: string[], callback: plarkcore.NewTxCallback): plarkcore.ITrackerClient {
        const coinKeyFormatter = this.networkClient.getCoin().getKeyFormat();

        const addrBuffers: Buffer[] = map(addrs, (addr: string) => {
            return coinKeyFormatter.parseAddress(addr).getData();
        });

        this.addrTxEvents = {
            addrs: addrBuffers,
            callback: callback,
        };

        return this;
    }

    /**
     * Check the address track or not
     *
     * @param {string|Buffer} address
     *
     * @return {boolean}
     */
    public isAddrTrack(address: string | Buffer): boolean {
        if (!address) {
            // For the case, when no FROM or TO in transaction
            return false;
        }

        let buffer;
        if (address instanceof Buffer) {
            buffer = address;
        } else {
            const coinKeyFormatter = this.networkClient.getCoin().getKeyFormat();
            try {
                buffer = coinKeyFormatter.parseAddress(address).getData();
            } catch (error) {
                this.debug("Can not parse address %s", address);

                return false;
            }
        }

        const { addrs = [] } = this.addrTxEvents;

        return !!find(addrs, (addr: Buffer) => {
            return buffer.equals(addr);
        });
    }


    protected fireNewBlock(block: Wallet.Entity.Block): boolean {
        return this.emit(TrackerEvent.Block, block);
    }

    protected fireConnect(): boolean {
        return this.emit(TrackerEvent.Connect);
    }

    protected fireDisconnect(): boolean {
        return this.emit(TrackerEvent.Disconnect);
    }

    protected fireConnectionError(error: Error): boolean {
        return this.emit(TrackerEvent.ConnectionError, error);
    }

    protected async fireTxidConfirmation(tx: Wallet.Entity.WalletTransaction): Promise<void> {
        this.emit(`tx.${tx.txid}`, tx);
    }

    public destruct() {
        this.stop();

        this.addrTxEvents = { addrs: [], callback: undefined };

        this.removeAllListeners('tx.*');
        this.removeAllListeners('addr.*');
    }
}
