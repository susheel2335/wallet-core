
export enum ScriptType {
    WitnessPubKeyHash = 'witnesspubkeyhash',
    WitnessScriptHash = 'witnessscripthash',
    WitnessCommitment = 'witnesscommitment',
    PubKeyHash = 'pubkeyhash',
    ScriptHash = 'scripthash',
    Multisig = 'multisig',
    PubKey = 'pubkey',
    NullData = 'nulldata',
    NonStandard = 'nonstandard'
}

export enum BalanceScheme {
    UTXO, //bitcoin model
    ADDRESS_BALANCE //ethereum model
}

export enum TransactionScheme {
    INPUTS_OUTPUTS, //bitcoin model
    FROM_TO //ethereum model
}

export enum Unit {
    BTC = 'BTC',
    LTC = 'LTC',
    ETH = 'ETH',
    DASH = 'DASH',

    // Testnet
    BTCt = 'BTCt',
    LTCt = 'LTCt',
    ETHt = 'ETHt',
    DASHt = 'DASHt'
}

export type SignInputData = {
    value: number;
};


