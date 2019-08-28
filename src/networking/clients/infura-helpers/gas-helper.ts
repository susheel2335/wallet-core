import BigNumber from 'bignumber.js';
import { crypto } from 'bitcoinjs-lib';
import { get } from 'lodash';
import * as Constants from '../../../constants';
import { Utils } from '../../../utils';
import InfuraNetworkClient from '../infura-network-client';

/**
 * GasHelper is a provider of check and cache Gas Price and Gas estimation
 */
export default class GasHelper {
    protected client: InfuraNetworkClient;

    private gasPriceCache?: plarkcore.GasPrice;
    private gasPriceTimeout?: number;
    private estimateGasCache: Record<string, [number, BigNumber]> = {};

    /**
     * GasHelper constructor.
     *
     * @param {InfuraNetworkClient}     client
     */
    public constructor(client: InfuraNetworkClient) {
        this.client = client;
    }

    /**
     * @return {plarkcore.GasPrice}
     */
    public async getGasPrice(): Promise<plarkcore.GasPrice> {
        if (this.gasPriceExpired()) {
            this.gasPriceCache = await this.fetchGasPrice();
        }

        return this.gasPriceCache;
    }

    /**
     * Check if GasPrice expired or not
     *
     * @return {boolean}
     */
    protected gasPriceExpired(): boolean {
        if (!this.gasPriceTimeout || !this.gasPriceCache) {
            return true;
        }

        return this.gasPriceTimeout - 3 * 60 * 1000 <= new Date().getTime();
    }

    /**
     * @return {plarkcore.GasPrice}
     */
    protected async fetchGasPrice(): Promise<plarkcore.GasPrice> {
        const standardGasPrice = new BigNumber(4);
        const defaultGasPrice = {
            low: standardGasPrice,
            medium: standardGasPrice.times(2),
            high: standardGasPrice.times(4),
        };

        try {
            const data = await this.client.sendRequest('eth_gasPrice');
            const gasPrices = new BigNumber(data.result).div(Constants.WEI_PER_GWEI);

            if (!gasPrices) {
                return defaultGasPrice;
            }

            return {
                low: gasPrices.div(2),
                medium: gasPrices,
                high: gasPrices.times(4),
            } as plarkcore.GasPrice;
        } catch (error) {
            return defaultGasPrice;
        }
    }


    /**
     * @param {EstimateGasRequestOptions}   options
     *
     * @return {BigNumber}
     *
     * @TODO Need complete functional with Gas Price by extending functional
     *       and made it more abstract
     */
    public async estimateGas(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
        const key = crypto
            .sha1(
                Buffer.from(JSON.stringify({ to: options.to, data: options.data })),
            )
            .toString('hex');

        const [timeout, value] = get(this.estimateGasCache, key, [undefined, undefined]);

        if (value) return value;

        let newValue = await this.fetchEstimateGas(options);
        this.estimateGasCache[key] = [new Date().getTime(), newValue];

        return newValue;
    }


    /**
     * @param {EstimateGasRequestOptions}   options
     *
     * @return {BigNumber}
     */
    public async fetchEstimateGas(options: plarkcore.eth.EstimateGasRequestOptions): Promise<BigNumber> {
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
