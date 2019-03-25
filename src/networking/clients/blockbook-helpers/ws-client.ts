import io from 'socket.io-client';
import { Destructable } from '../../../utils';

export type WsCallback = (result: Object) => void;
export default class WsClient implements Destructable {
    protected wsUrl: string;
    protected ws: SocketIOClient.Socket;

    protected isOpen: boolean = false;

    protected openingPromise?: Promise<SocketIOClient.Socket>;

    public constructor(wsUrl: string) {
        this.wsUrl = wsUrl;

        this.ws = io.connect(this.wsUrl, {
            timeout: 1000,
            autoConnect: false,
            transports: ['websocket'],
        });

        this.init();
    }


    public destruct(): void {
        this.isOpen = false;

        if (this.ws) {
            this.ws.close();
        }
    }


    public async init(): Promise<SocketIOClient.Socket> {
        if (this.isOpen) {
            return this.ws;
        }

        if (this.openingPromise) {
            return this.openingPromise;
        }

        this._openWebSocket();

        this.openingPromise = new Promise<SocketIOClient.Socket>((resolve, reject) => {
            this.ws.once('connect', () => {
                delete this.openingPromise;

                resolve(this.ws);
            });

            this.ws.once('connect_timeout', () => {
                console.warn('Connection Timeout!');

                delete this.openingPromise;
                this.__closeWS();

                reject();
            });
        });

        return this.openingPromise;
    }


    public async send<R = any>(method: string, params: any[] = []): Promise<R> {
        const ws = await this.init();

        return new Promise<R>((resolve, reject) => {
            ws.send({ method, params }, (reply) => {
                if (reply.error) {
                    reject(new Error(reply.error.message));
                }

                resolve(reply.result);
            });
        });
    }


    protected _openWebSocket(): void {
        this.ws.once('disconnect', this.__closeWS);

        this.ws.open();
    }


    private __closeWS = () => {
        this.isOpen = false;

        this.ws.close();
        this.ws.removeAllListeners();
    };
}
