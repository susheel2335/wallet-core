import BigNumber from 'bignumber.js';

export default {
    ETHERSCAN_API_KEY: 'PY4P1BMTRKT3E2J1IQGVEFVVNGZ5FTSUMG',

    MIN_ADDRESS_COUNT: 10,

    WD_UPDATE_TIMEOUT: 2000,

    SATOSHI_PER_COIN: new BigNumber(1E8),

    //Ethereum units
    WEI_PER_COIN: new BigNumber(1E18),
    KWEI_PER_COIN: new BigNumber(1E15),
    MWEI_PER_COIN: new BigNumber(1E12),
    GWEI_PER_COIN: new BigNumber(1E9),


    MIN_GAS_LIMIT: new BigNumber(54000),
};
