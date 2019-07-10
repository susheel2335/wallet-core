import BitcoinJS from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import assert from 'assert';
import { Coin, HD } from '../../';
import { seed } from '../fixtures/seed';

describe('Create and sign Bitcoin transaction', () => {

    const coin = Coin.makeCoin(Coin.Unit.BTC);
    const privateCoin = coin.makePrivateFromSeed(seed);

    const alice = {};
    alice.node = privateCoin.deriveAddress(HD.BIP44.AddressType.RECEIVE, 0);
    alice.address = alice.node.getPublicKey().toAddress(Coin.Key.AddressFormat.P2PKH).toString();
    alice.prevOutScript = BitcoinJS.address.toOutputScript(alice.address, coin.networkInfo());

    const bob = {};
    bob.node = privateCoin.deriveAddress(HD.BIP44.AddressType.RECEIVE, 1);
    bob.address = bob.node.getPublicKey().toAddress(Coin.Key.AddressFormat.P2SH).toString();
    bob.prevOutScript = BitcoinJS.address.toOutputScript(bob.address, coin.networkInfo());

    const calvin = {};
    calvin.node = privateCoin.deriveAddress(HD.BIP44.AddressType.RECEIVE, 2);
    calvin.address = calvin.node.getPublicKey().toAddress(Coin.Key.AddressFormat.BECH32).toString();
    calvin.prevOutScript = BitcoinJS.address.toOutputScript(calvin.address, coin.networkInfo());


    it('Can create P2PKH to P2PKH', () => {
        const transactionBuilder = new Coin.Transaction.BIPTransactionBuilder(coin);
        const privateKeys = [];
        const inputData = [];

        transactionBuilder.addInput(
            '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            0,
            null,
            alice.prevOutScript
        );

        privateKeys.push(alice.node.getPrivateKey());
        inputData.push({value: 300000});

        transactionBuilder.addOutput(
            coin.getKeyFormat().parseAddress('1P2nDouUVFKSdrqCGrBSd3UYRaNr4kaKoh'),
            new BigNumber(200000)
        );

        const signedTransaction = transactionBuilder.buildSigned(privateKeys, inputData);

        assert.strictEqual(
            signedTransaction.id,
            'f59166173d26aed71f222c244210576ea9849f3e1663c86d4d280212e499e6d9'
        );
    });


    it('Can create P2PKH, P2SH to P2PKH, P2WPH', () => {
        const transactionBuilder = new Coin.Transaction.BIPTransactionBuilder(coin);
        const privateKeys = [];
        const inputData = [];

        /** Add Alice (P2PKH) address */
        transactionBuilder.addInput(
            '902547cf257f3b276c97a568a78e1bccd2521eec087eb6c89c4fa2aea6bf4384',
            0,
            null,
            alice.prevOutScript
        );
        privateKeys.push(alice.node.getPrivateKey());
        inputData.push({value: 300000});


        /** Add Bob (P2SH) address */
        transactionBuilder.addInput(
            '23eed7e3cea94c0c9ee88de41abebedaec0cc71a346c187b0eb34690f02c2174',
            0,
            null,
            bob.prevOutScript
        );
        privateKeys.push(bob.node.getPrivateKey());
        inputData.push({value: 200000});




        transactionBuilder.addOutput(
            coin.getKeyFormat().parseAddress('1P2nDouUVFKSdrqCGrBSd3UYRaNr4kaKoh'),
            new BigNumber(150000)
        );

        transactionBuilder.addOutput(
            coin.getKeyFormat().parseAddress('bc1qnsupj8eqya02nm8v6tmk93zslu2e2z8chlmcej'),
            new BigNumber(150000)
        );

        const signedTransaction = transactionBuilder.buildSigned(privateKeys, inputData);

        assert.strictEqual(
            signedTransaction.id,
            '83342fd9922ae88034137817a3b991d20776655c99be037764a17772186afe25'
        );
    });
});



