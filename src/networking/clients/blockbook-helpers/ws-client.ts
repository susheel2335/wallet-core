import io from 'socket.io-client';

export default class WsClient implements plarkcore.Destructible {
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

        this.__openWS();

        this.openingPromise = new Promise<SocketIOClient.Socket>((resolve, reject) => {
            this.ws.once('connect', () => {
                delete this.openingPromise;
                this.isOpen = true;
                
                resolve(this.ws);
            });

            this.ws.once('connect_timeout', () => {
                console.warn('Connection Timeout!');

                delete this.openingPromise;
                this.__closeWS();

                reject();
            });

            this.ws.once('connect_error', (error) => {
                console.warn('Connection Error!');

                delete this.openingPromise;
                this.__closeWS();

                reject(error.message);
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


    protected __openWS(): void {
        this.ws.once('disconnect', this.__closeWS);

        this.ws.open();
    }


    protected __closeWS = () => {
        this.isOpen = false;

        this.ws.close();
        this.ws.removeAllListeners();
    };
}
