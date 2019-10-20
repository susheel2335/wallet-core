import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import assert from 'assert';
import { Coin, HD } from '../../';
import { seed } from '../fixtures/seed';

const transactions = [
    {
        description: 'P2PKH to P2PKH',
        coin: Coin.Unit.BTC,
        utxos: [{
            txid: '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            vout: 0,
            value: 20020000,
            address: [HD.BIP44.AddressType.CHANGE, 0],
            addressFormat: Coin.Key.AddressFormat.P2PKH
        }],
        outputs: [{
            address: '1P2nDouUVFKSdrqCGrBSd3UYRaNr4kaKoh',
            value: 0.2
        }],
        txid: '7d85f4ed9ea60da6a46c575c906819cbaead20306d382247eb4d288c62621ef1',
    },
    {
        description: 'P2PKH to P2PKH',
        coin: Coin.Unit.BCH,
        utxos: [{
            txid: '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            vout: 0,
            value: 20020000,
            address: [HD.BIP44.AddressType.CHANGE, 0],
            addressFormat: Coin.Key.AddressFormat.P2PKH
        }],
        outputs: [{
            address: 'bitcoincash:qrdka2205f4hyukutc2g0s6lykperc8nsu5u2ddpqf',
            value: 0.2
        }],
        txid: 'aff142e5aadd3efbbebfcff9d6f72f8b960e50c47061b026923e29a4ee4fdbad',
    },
    {
        description: 'P2SH to P2SH',
        coin: Coin.Unit.BCH,
        utxos: [{
            txid: '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            vout: 0,
            value: 20020000,
            address: [HD.BIP44.AddressType.CHANGE, 0],
            addressFormat: Coin.Key.AddressFormat.P2SH
        }],
        outputs: [{
            address: 'bitcoincash:pzqmjwk8929jtqt7ac7szjuawtswmxhtu5xxm64upf',
            value: 0.2
        }],
        txid: '0acd7f71a7a744af7c83829563927f4b197a860e847cc1d8eeafa8cb5a6d77f2',
    },
    {
        description: 'P2PKH, P2SH to P2PKH, P2WPH',
        coin: Coin.Unit.BTC,
        utxos: [{
            txid: '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            vout: 0,
            value: 200000,
            address: [HD.BIP44.AddressType.RECEIVE, 0],
            addressFormat: Coin.Key.AddressFormat.P2PKH
        }, {
            txid: '23eed7e3cea94c0c9ee88de41abebedaec0cc71a346c187b0eb34690f02c2174',
            vout: 0,
            value: 300000,
            address: [HD.BIP44.AddressType.RECEIVE, 1],
            addressFormat: Coin.Key.AddressFormat.BECH32
        }],
        outputs: [{
            address: '1P2nDouUVFKSdrqCGrBSd3UYRaNr4kaKoh',
            value: 0.1
        }, {
            address: 'bc1qnsupj8eqya02nm8v6tmk93zslu2e2z8chlmcej',
            value: 0.1
        }],
        txid: '09a508f3e8ec2335b46da03fe72fb9224b0d65abe9d5f8a36020788c48a72822',
    },
    {
        description: 'P2PKH to P2PKH, P2SH, P2WPH',
        coin: Coin.Unit.BTCt,
        utxos: [{
            txid: '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            vout: 0,
            value: 2125358843,
            address: [HD.BIP44.AddressType.CHANGE, 0],
            addressFormat: Coin.Key.AddressFormat.P2PKH
        }],
        outputs: [{
            address: 'mqErxFsyMcw3bKBS1XV5s4AdCYdUuZUhPq',
            value: 0.1
        }, {
            address: '2Mx2vq72ZA7tUKhAY3gBdR8hLNbkNCjJkfr',
            value: 0.1
        }, {
            address: 'tb1qd2nzfnq9jfa8jftwwkfcjxfyh94j4q3yz9s7t4',
            value: 0.1
        }],
        txid: 'b9acedf1ae99c0ad3fe536a6ab7237851162244af516019e2808fb4cefc86c65',
    },
    {
        description: 'P2WSH to P2SH',
        coin: Coin.Unit.BTCt,
        utxos: [{
            txid: '23eed7e3cea94c0c9ee88de41abebedaec0cc71a346c187b0eb34690f02c2174',
            vout: 0,
            value: 100000000,
            address: [HD.BIP44.AddressType.RECEIVE, 0],
            addressFormat: Coin.Key.AddressFormat.P2SH
        }],
        outputs: [{
            address: '2N5WWwmHsbyhn8pKUEDZfExD7MFX3jUsNXA',
            value: 0.99
        }],
        txid: '3e34da1cd104bd4e9d3c1c1b6c3b721be37b08875e1703b2b9b699967d071406',
    },
    {
        description: 'P2WPH to P2SH',
        coin: Coin.Unit.BTCt,
        utxos: [{
            txid: '23eed7e3cea94c0c9ee88de41abebedaec0cc71a346c187b0eb34690f02c2174',
            vout: 0,
            value: 100000000,
            address: [HD.BIP44.AddressType.RECEIVE, 0],
            addressFormat: Coin.Key.AddressFormat.BECH32
        }],
        outputs: [{
            address: '2N5WWwmHsbyhn8pKUEDZfExD7MFX3jUsNXA',
            value: 0.99
        }],
        txid: '51db8c668f6da7c8e54be6376a8af91e001d0231048e1d9cd3e451af8e91a96b',
    }
];


const provideTransaction = (txInfo) => {
    it(`[${txInfo.coin}] Can create ${txInfo.description}`, () => {

        const coin = Coin.makeCoin(txInfo.coin);
        const privateCoin = coin.makePrivateFromSeed(seed);

        const transactionBuilder = Coin.Transaction.createTransactionBuilder(coin);
        const privateKeys = [];
        const inputData = [];

        txInfo.utxos.map((utxo) => {
            const addressNode = privateCoin.deriveAddress(...utxo.address);
            const addressString
                = addressNode.getPublicKey().toAddress(utxo.addressFormat).toString({ forceLegacy: true });

            const prevOutScript
                = BitcoinJS.address.toOutputScript(addressString, coin.networkInfo());

            transactionBuilder.addInput(
                utxo.txid,
                utxo.vout,
                null,
                prevOutScript
            );

            privateKeys.push(addressNode.getPrivateKey());
            inputData.push({value: utxo.value});
        });

        txInfo.outputs.map((out) => {
            const receiveAddrString = coin.getKeyFormat().parseAddress(out.address);
            transactionBuilder.addOutput(receiveAddrString, new BigNumber(out.value));
        });

        const signedTransaction = transactionBuilder.buildSigned(privateKeys, inputData);

        assert.strictEqual(signedTransaction.id, txInfo.txid);
    });
};

describe('Create transaction', () => {
    transactions.map(provideTransaction);
});



