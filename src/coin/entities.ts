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
    UTXO,                           // Bitcoin model
    ADDRESS_BALANCE                 // Ethereum model
}

export enum TransactionScheme {
    INPUTS_OUTPUTS,                 // Bitcoin model
    FROM_TO                         // Ethereum model
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


