import BigNumber from 'bignumber.js';
import { Constants, Utils } from '../../../';
import { GasPrice } from '../network-client';
import InfuraNetworkClient from '../infura-network-client';

export default class GasHelper {
    protected client: InfuraNetworkClient;

    private gasPriceCache?: GasPrice;
    private gasPriceTimeout?: number;

    public constructor(client: InfuraNetworkClient) {
        this.client = client;
    }

    public async getGasPrice(): Promise<GasPrice> {
        if (this.gasPriceExpired()) {
            this.gasPriceCache = await this.fetchGasPrice();
        }

        return this.gasPriceCache;
    }

    protected gasPriceExpired() {
        if (!this.gasPriceTimeout || !this.gasPriceCache) {
            return true;
        }

        return this.gasPriceTimeout - 3 * 60 * 1000 <= new Date().getTime();
    }

    protected async fetchGasPrice(): Promise<GasPrice> {
        const standardGasPrice = new BigNumber(4).div(Constants.WEI_PER_COIN);
        const defaultGasPrice = {
            low: standardGasPrice,
            standard: standardGasPrice.times(2),
            high: standardGasPrice.times(4),
        };

        try {
            const data = await this.client.sendRequest('eth_gasPrice');
            const gasPrices = new BigNumber(data.result).div(Constants.GWEI_PER_COIN);

            if (!gasPrices) {
                return defaultGasPrice;
            }

            return {
                low: gasPrices.div(2),
                standard: gasPrices,
                high: gasPrices.times(4),
            } as GasPrice;
        } catch (error) {
            return defaultGasPrice;
        }
    }

    public async estimateGas(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
        const { to, from, value, data, gas, gasPrice } = options;

        const requestData: any = {};
        if (to) {
            requestData.to = typeof to === 'string' ? to : to.toString();
        }

        if (from) {
            requestData.from = typeof from === 'string' ? from : from.toString();
        }

        requestData.value = value ? Utils.numberToHex(value.times(Constants.WEI_PER_COIN)) : 0;
        requestData.gas = gas ? Utils.numberToHex(gas) : undefined;
        requestData.gasPrice = gasPrice ? Utils.numberToHex(gasPrice) : undefined;
        requestData.data = data;

        const response = await this.client.sendRequest('eth_estimateGas', [requestData]);

        return new BigNumber(response.result as string);
    }
}
