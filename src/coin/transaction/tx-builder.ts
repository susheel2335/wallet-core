import { Transaction } from './transaction';
import { TransactionScheme, SignInputData } from '../entities';
import * as Key from '../key';

export interface TransactionBuilder {
    readonly scheme: TransactionScheme;

    buildSigned(keys: Key.Private[], inputData?: SignInputData[]): Transaction;

    buildUnsigned(): Transaction;

    reset();
}
