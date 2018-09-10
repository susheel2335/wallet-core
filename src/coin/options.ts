export interface CoinOptionsInterface {
    get(key: string): any

    has(key: string): boolean

    toObject(): any
}

export abstract class AbstractCoinOptions implements CoinOptionsInterface {

    public constructor(protected options?: any) {
        if (!this.options) {
            this.options = {};
        }
    }

    public get(key: string): any {
        if (this.has(key)) {
            return this.options[key];
        }

        throw TypeError(`No option for key ${key}`);
    }

    public has(key: string): boolean {
        return this.options.hasOwnProperty(key);
    }

    public toObject(): any {
        return this.options;
    }
}

export class BIPCoinOptions extends AbstractCoinOptions {

}

export class EthereumOptions extends AbstractCoinOptions {

}

export function decorateOptions<T extends AbstractCoinOptions>(type: { new(any): T }, options: CoinOptionsInterface): T {
    return new type(options.toObject());
}
