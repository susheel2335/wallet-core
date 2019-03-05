import io from 'socket.io-client';
import { Destructable } from '../../../utils';

export type WsCallback = (result: Object) => void;
export default class WsClient implements Destructable {
    protected wsUrl: string;
    protected ws?: SocketIOClient.Socket;

    protected messageID: number = 0;
    protected pendingMessages: Record<string, WsCallback> = {};


    public constructor(wsUrl: string) {
        this.wsUrl = wsUrl;

        this.init();
    }


    public destruct(): void {
        if (this.ws) {
            this.ws.close();
        }
    }


    public async init(): Promise<SocketIOClient.Socket> {
        if (this.ws) {
            return this.ws;
        }

        this.ws = this._createWebSocket();

        return new Promise<SocketIOClient.Socket>((resolve) => {
            this.ws.once('connect', () => {
                resolve(this.ws);
            });
        });
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


    protected _createWebSocket(): SocketIOClient.Socket {
        const ws = io.connect(this.wsUrl, {
            timeout: 1000,
            transports: ['websocket'],
        });

        ws.on('disconnect', this.__closeWS);
        ws.on('connect_timeout', this.__closeWS);

        return ws;
    }

    private __onOpenError = (err: Error) => {
        console.error('OpenError', err);
    };


    private __closeWS = () => {
        this.ws.close();
        delete this.ws;
    };
}
