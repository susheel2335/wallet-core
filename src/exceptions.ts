namespace Exceptions {
    export enum ExceptionCodes {
        Balance_Error = 1001,
        Insufficient_Funds = 2001
    }

    export interface PlarkException extends Error {
        code: ExceptionCodes | number;
    }

    export class InsufficientFundsException extends Error implements PlarkException {
        public code = ExceptionCodes.Insufficient_Funds;

        public constructor(message?: string) {
            super(message || 'Insufficient funds');

            this.name = 'InsufficientFundsException';
        }
    }


    export class BalanceException extends Error implements PlarkException {
        public code = ExceptionCodes.Balance_Error;

        public constructor(message?: string) {
            super(message || 'Balance calculation error');

            this.name = 'BalanceException';
        }
    }
}

export default Exceptions;
