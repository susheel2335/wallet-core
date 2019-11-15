import { makeCoin } from './';
import { Unit } from './entities';
import * as Key from './key'

/**
 * Method parse your crypto address and return it
 *
 * @param {Unit} unit
 * @param {string} address
 * @returns {Address}
 */
export function parseAddressByCoin(unit: Unit, address: string): Key.Address {
    return makeCoin(unit).getKeyFormat().parseAddress(address);
}
