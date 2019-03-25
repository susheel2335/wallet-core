import { forEach, chunk } from 'lodash';
import { Wallet } from '../../../';
import { BlockbookNetworkClient } from '../';
import { ITrackerClient, TrackerClient, TrackerEvent } from './tracker-client';

export default class BlockbookTrackerProvider extends TrackerClient<BlockbookNetworkClient> {
    public constructor(networkClient: BlockbookNetworkClient) {
        super(networkClient);

        this.bindListeners();
    }

    protected async bindListeners() {
        const ws = await this.networkClient.getWSClient().init();

        this.emit(TrackerEvent.Connect);

        ws.emit('subscribe', 'bitcoind/hashblock');
        ws.on('bitcoind/hashblock', this.handleBlockHash);
        ws.on('bitcoind/addresstxid', this.handleTxid);
    }


    protected fireNewBlock(block: Wallet.Entity.Block): boolean {
        forEach(block.txids, async (txid) => {
            if (this.listenerCount('tx.' + txid) === 0) return;

            const tx = await this.networkClient.getTx(txid);
            tx && this.fireTxidConfirmation(tx);
        });

        return super.fireNewBlock(block);
    }


    protected handleBlockHash = async (blockHash: string) => {
        try {
            const block = await this.networkClient.getBlock(blockHash);
            this.fireNewBlock(block);
        } catch (error) {
            throw new Error(
                `Error on handle block "${blockHash}" of "${this.networkClient.getCoin().getName()}":
                ${error.message}`,
            );
        }
    };


    protected handleTxid = async (data: { address: string; txid: string; }) => {
        const { callback, addrs } = this.addrTxEvents;
        if (!callback || addrs.length === 0) {
            return;
        }

        const responseTx: Wallet.Entity.BIPTransaction = await this.networkClient.getTx(data.txid);
        callback(responseTx);
    };


    public onAddrsTx(addrs: string[], callback: plarkcore.NewTxCallback): ITrackerClient {
        const addressChunks = chunk(addrs, 20);
        super.onAddrsTx(addrs, callback);

        this.networkClient.getWSClient().init()
            .then(ws => {
                addressChunks.forEach((ch: string[]) => {
                    ws.emit('subscribe', 'bitcoind/addresstxid', ch);
                });
            });

        return;
    }


    public destruct() {
        this.fireDisconnect();
    }
}