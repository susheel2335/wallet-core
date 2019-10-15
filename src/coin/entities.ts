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
    // Bitcoin model
    UTXO,

    // Ethereum model
    ADDRESS_BALANCE
}

export enum TransactionScheme {
    // Bitcoin model
    INPUTS_OUTPUTS,

    // Ethereum model
    FROM_TO
}

export enum Unit {
    BTC = 'BTC',
    BCH = 'BCH',
    LTC = 'LTC',
    ETH = 'ETH',
    DASH = 'DASH',

    // Testnet
    BTCt = 'BTCt',
    BCHt = 'BCHt',
    LTCt = 'LTCt',
    ETHt = 'ETHt',
    DASHt = 'DASHt'
}

export type SignInputData = {
    value: number;
};
