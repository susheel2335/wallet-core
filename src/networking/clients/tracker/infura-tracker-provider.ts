import { forEach, get } from 'lodash';
import { WebsocketProvider } from 'web3-providers';
import { Wallet } from '../../../';
import { Infura } from '../../api';
import { InfuraNetworkClient } from '../';
import { TrackerClient } from './tracker-client';

export default class InfuraTrackerProvider extends TrackerClient<InfuraNetworkClient> {
    protected currentBlockHeight?: number;
    protected currentBlockTime?: number;

    protected socket: WebsocketProvider;


    protected subscription: string;

    public constructor(networkClient: InfuraNetworkClient) {
        super(networkClient);
        this.socket = new WebsocketProvider(this.networkClient.getWSUrl());

        this.startBlockTracking();
    }


    protected startBlockTracking() {
        this.socket.on('connect', this.__onConnect);
    }


    protected __onConnect = () => {
        this.debug('Socket connected!');

        this.fireConnect();
        this.socket.removeListener('connect', this.__onConnect);

        this.socket
            .subscribe('eth_subscribe', 'newHeads', [])
            .then((subscription: string) => {
                this.subscription = subscription;
                this.socket.on(subscription, this.__handleBlock);

                console.log(subscription);
            });
    };


    protected __handleBlock = async (...data: any[]) => {
        const rawBlock = get(data, '[0]result', undefined);
        if (!rawBlock || !rawBlock.hash) {
            return;
        }

        try {
            const block = await this.networkClient.getBlock(rawBlock.hash);
            this.fireNewBlock(block);
        } catch (error) {

        }
    };


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


    public destruct() {
        this.socket.disconnect(1001, 'Need to say Bye!');

        if (this.subscription) {
            this.socket.removeAllListeners(this.subscription);
            delete this.subscription;
        }

        this.socket.removeAllListeners('connect');
        this.fireDisconnect();

        super.destruct();
    }
}
