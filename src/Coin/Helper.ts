import {Coin} from "../";

/**
 * Method parse your crypto address and return it
 *
 * @param {Unit} unit
 * @param {string} address
 * @returns {Address}
 */
export function parseAddressByCoin(unit: Coin.Unit, address: string): Coin.Key.Address {
    return Coin.makeCoin(unit).getKeyFormat().parseAddress(address);
}