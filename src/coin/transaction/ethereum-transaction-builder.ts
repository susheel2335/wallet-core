import BigNumber from 'bignumber.js';
import { Utils } from '../../utils';
import * as Constants from '../../constants';
import * as Coin from '../';
import * as Key from '../key';

import { TransactionBuilder } from './tx-builder';
import { EthereumTransaction } from './ethereum-transaction';

const EthereumTx = require('ethereumjs-tx');

export class EthereumTransactionBuilder implements TransactionBuilder {

    protected readonly coin: Coin.Defined.Ethereum;

    private _nonce: number;
    private _gasLimit: number;
    private _gasPrice: BigNumber;
    private _value: BigNumber;
    private _data: Buffer;
    private _to: Key.Address;

    public constructor(coin: Coin.Defined.Ethereum) {
        if (!(coin instanceof Coin.Defined.Ethereum)) {
            throw TypeError('Only Ethereum coin supported');
        }

        this.coin = coin as Coin.Defined.Ethereum;
        this.reset();
    }

    public get scheme(): Coin.TransactionScheme {
        return Coin.TransactionScheme.FROM_TO;
    }

    public buildSigned(keys: Key.Private[]): EthereumTransaction {
        if (keys.length !== 1) {
            throw new Error('Ethereum requires one private key');
        }

        let tx = this.buildUnsigned().ethereumTx;
        tx.sign(keys[0].toBuffer());

        return new EthereumTransaction(this.coin, tx);
    }

    public buildUnsigned(): EthereumTransaction {
        if (this.to === undefined && this.data === undefined) {
            throw new Error('Either data or to must be set');
        }

        let ethTx = new EthereumTx;
        ethTx.chainId = this.coin.chainId;
        ethTx.nonce = this.nonce;
        ethTx.gasPrice = Utils.bigNumberToBuffer(this.gasPrice.times(Constants.WEI_PER_COIN));
        ethTx.gasLimit = this.gasLimit;
        ethTx.to = this.to ? this.to.getData() : Buffer.from('');
        ethTx.data = this.data;
        ethTx.value = Utils.bigNumberToBuffer(this.value.times(Constants.WEI_PER_COIN));

        return new EthereumTransaction(this.coin, ethTx);
    }

    public reset() {
        this.nonce = 0;
        this.gasPrice = this.coin.defaultGasPrice;
        this.gasLimit = this.coin.defaultGasLimit;
        this.value = new BigNumber(0);
        this.data = undefined;
        this.to = undefined;
    }

    public get nonce(): number {
        return this._nonce;
    }

    public set nonce(value: number) {
        if (!new BigNumber(value).isInteger() || value < 0) {
            throw new RangeError('Nonce must be a positive integer');
        }
        this._nonce = value;
    }

    public get gasPrice(): BigNumber {
        return this._gasPrice;
    }

    public set gasPrice(value: BigNumber) {
        Utils.validateAmountValue(value, this.coin.minValue, true);
        this._gasPrice = value;
    }

    public get gasLimit(): number {
        return this._gasLimit;
    }

    public set gasLimit(value: number) {
        let bn = new BigNumber(value);
        if (!bn.isInteger() || bn.isNegative()) {
            throw new RangeError('gasLimit must be a positive integer');
        }
        this._gasLimit = value;
    }

    public get value(): BigNumber {
        return this._value;
    }

    public set value(value: BigNumber) {
        Utils.validateAmountValue(value, this.coin.minValue, true);
        this._value = value;
    }

    public get data(): Buffer {
        return this._data;
    }

    public set data(value: Buffer) {
        this._data = value;
    }

    public get to(): Key.Address {
        return this._to;
    }

    public set to(value: Key.Address) {
        this._to = value;
    }
}
