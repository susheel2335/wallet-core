import * as Crypto from "./Crypto";
import BigNumber from "bignumber.js";
import * as EthereumJsUtil from "ethereumjs-util";

function isHexPrefixed(hex: string): boolean {
    return hex.slice(0, 2) === '0x';
}

/**
 *
 * @param {string} hex
 * @param {number} length Length in bytes, null for any
 * @param {number} prefix 0 - no prefix, 1 - required prefix, 2 - optional
 * @returns {boolean}
 */
function isHexValid(hex: string, length: number = null, prefix: number = 0): boolean {

    if (!/^(0x)?([0-9a-fA-F]+)?$/i.test(hex)) {
        return false;
    }

    let isPrefixed = isHexPrefixed(hex);
    if (prefix != 2 && (!!prefix) != isPrefixed) {
        return false;
    }

    if (length) {
        length *= 2;
        if (isPrefixed) {
            length += 2;
        }

        if (hex.length != length) {
            return false;
        }
    } else {
        let minLength = isPrefixed ? 2 : 0;
        if (hex.length < minLength || hex.length % 2 != 0) {
            return false;
        }
    }

    return true;
}


function addHexPrefix(hex: string|Buffer): string {
    if(hex instanceof Buffer) {
        hex = hex.toString('hex');
    }

    return EthereumJsUtil.addHexPrefix(hex);
}

function padHexToEven(a: string): string {
    if (a.length % 2) a = '0' + a;
    return a;
}

function hexToBuffer(hex: string): Buffer {
    if (!isHexValid(hex, null, 2)) {
        throw new TypeError(`Invalid hex string ${hex}`);
    }

    if (isHexPrefixed(hex)) {
        hex = hex.slice(2);
    }

    return Buffer.from(hex.toLowerCase(), 'hex');
}

function validateAmountValue(value: BigNumber, minValue: BigNumber, allowZero: boolean = true) {
    if (value.isNegative()) {
        throw new RangeError("Value cannot be negative");
    }
    if (value.decimalPlaces() > minValue.decimalPlaces()) {
        throw new RangeError(`Value (${value}) has more decimals than min value (${minValue})`);
    }
    if (!allowZero && value.isZero()) {
        throw new RangeError("Value cannot be zero");
    }
    return value;
}


function bigNumberToBuffer(value: BigNumber): Buffer {
    if (!value.isInt()) {
        throw new Error("Value must be integer")
    }

    return hexToBuffer(padHexToEven(value.toString(16)));
}

function bufferToBigNumber(buffer: Buffer): BigNumber {
    return new BigNumber(buffer.toString('hex'), 16);
}

/**
 * @param {number | BigNumber} number 
 */
function numberToHex(number: number | BigNumber): string {
    return "0x" + (new BigNumber(number).toString(16));
}

/**
 * @param hexNumber 
 */
function hexToBigNumber(hexNumber: string): BigNumber {
    return new BigNumber(hexNumber);
}


export {
    Crypto,

    isHexPrefixed,
    isHexValid,
    addHexPrefix,

    hexToBuffer,
    numberToHex,
    hexToBigNumber,

    validateAmountValue,

    bigNumberToBuffer,
    bufferToBigNumber
};