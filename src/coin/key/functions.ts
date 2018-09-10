import BitcoinJS from 'bitcoinjs-lib';
import * as Utils from '../../utils';

export function getRedeemScript(pubKey: Buffer): Buffer {
    const publicKeyHash = Utils.Crypto.hash160(pubKey);

    return BitcoinJS.script.witnessPubKeyHash.output.encode(publicKeyHash);
}
