declare module 'etherscan-api' {
    type BlockNumber = number | 'latest';

    type Sort = 'asc' | 'desc';

    type EtherscanResponse<R = any> = {
        result: R;
        status: '0' | '1';
        message: string;
    };

    interface Web3Proxy {
        eth_gasPrice(): Promise<EtherscanResponse>;

        eth_sendRawTransaction(transactionHex: string): Promise<EtherscanResponse>;

        eth_getTransactionByHash(txid: string): Promise<EtherscanResponse>;
    }

    interface EtherscanAccount {
        txlist(address: string, startBlock: BlockNumber, endBlock: BlockNumber, sort: Sort): Promise<EtherscanResponse<any[]>>;

        txlistinternal(txhash: string, address: string, startBlock: BlockNumber, endBlock: BlockNumber, sort: Sort): Promise<EtherscanResponse<any[]>>;

        balance(address: string): Promise<EtherscanResponse<string>>;
    }

    class EtherscanApiClient {
        public readonly proxy: Web3Proxy & any;
        public readonly account: EtherscanAccount & any;
    }

    function init(apiKey?: string, network?: string): EtherscanApiClient;
}
