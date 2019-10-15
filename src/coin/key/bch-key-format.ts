import bchaddr from 'bchaddrjs';
import { BIPKeyFormat } from './bip-key-format';
import { Address } from './key-utils';

export class BCHKeyFormat extends BIPKeyFormat {
    /**
     * Function to format address string bitcoincash:q* to Address object
     *
     * @return Address
     */
    public parseAddress(address: string): Address {
        if (!bchaddr.isValidAddress(address)) {
            throw new Error(`Invalid BCH address ${address}`);
        }

        address = bchaddr.toLegacyAddress(address);

        return super.parseAddress(address);
    }

    /**
     * Function to format Address object to string address bitcoincash:q*
     *
     * @param {Address} address
     * @param {any}     options
     *
     * @return string
     */
    public formatAddress(address: Address, options?: any): string {
        const addrString = super.formatAddress(address, options);

        return options.forceLegacy
            ? addrString
            : bchaddr.toCashAddress(addrString);
    }
}
