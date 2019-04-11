import { Coin, HD } from '../../lib';
import BitcoinJS from 'bitcoinjs-lib';
import assert from 'assert';

import { seed } from '../fixtures/seed';

const coinAddresses = {
    [Coin.Unit.BTC]: {
        pubKey: '138YZBjQH64shbppyHHRjHPhrBFDNxCdFZ',
        scriptHash: '33YvApNWoxSZtx3NXVe5SGH1aJVBNJtp7Z',
        bech32: 'bc1qzawczpe0z57ysap0z8j28mulkg2qmlqmvcd4kt'
    },
    [Coin.Unit.BTCt]: {
        pubKey: 'mm5GgtNrzXKE7y8LZhtdvX6uhuTmWL12eZ',
        scriptHash: '2N5WWwmHsbyhn8pKUEDZfExD7MFX3jUsNXA',
        bech32: 'tb1q8n65ks9phxydqgh5ramkk9rphr5vjlqywzxpnt'
    },
    [Coin.Unit.LTC]: {
        pubKey: 'LdvnFp1A49PjJeeTJgmvxwWNkTn9TWwM8M',
        scriptHash: 'MMr9vJqmk2SDXBmAqaDbH2G8GrgzyojewX',
        bech32: 'ltc1qe540w904ffscvdgwg2j8ydzx8sw0ehjz7cxn4w'
    },
    [Coin.Unit.LTCt]: {
        pubKey: 'mzDnHenJnWavpxRur7m1WqewQF1aDCFDMQ',
        scriptHash: '2N7CDgAMqQN68vU7pQpr85KzzAWJigsW2mn',
        bech32: 'tltc1qe540w904ffscvdgwg2j8ydzx8sw0ehjzf296xy'
    },
    [Coin.Unit.DASH]: {
        pubKey: 'XsjHjeDCR9zSQxi4x5uUdLUXqpzqAk3nZb',
        scriptHash: '7SdXdxz4EB2MRqjGdzTACBHKjAMcqkxL8i',
    },
    [Coin.Unit.DASHt]: {
        pubKey: 'ydMtkbHdrheWkhdcWwDsfMtt87VCjnedJm',
        scriptHash: '8eeLbHsvMiQyt99XiFT7eZ6gcg8T19pMYU',
    }
};

function checkAddressOutputScript(address, network) {
    assert.doesNotThrow(
        () => {
            BitcoinJS.address.toOutputScript(address, network);
        },
        `Can not create OutputScript for address: ${address}`
    );
}

describe('Create address', () => {
    for (const coinUnit in coinAddresses) {
        const coinCases = coinAddresses[coinUnit];
        const coin = Coin.makeCoin(coinUnit);

        describe(`Create addresses for ${coinUnit}`, () => {
            const privateCoin = coin.makePrivateFromSeed(seed).deriveAddress(HD.BIP44.AddressType.RECEIVE, 0);

            let pubKeyAddress, scriptHashAddress, witnessAddress;

            it(`Can create pubKey address`, () => {
                pubKeyAddress = privateCoin.getPublicKey().toAddress(Coin.Key.AddressFormat.P2PKH).toString();
                assert.strictEqual(pubKeyAddress, coinCases.pubKey);
            });

            it(`Can create outputScript for pubKey address`, () => {
                checkAddressOutputScript(pubKeyAddress, coin.networkInfo());
            });

            if (coinCases.scriptHash) {
                it(`Can create scriptHash address`, () => {
                    scriptHashAddress = privateCoin.getPublicKey().toAddress(Coin.Key.AddressFormat.P2SH).toString();
                    assert.strictEqual(scriptHashAddress, coinCases.scriptHash);
                });

                it(`Can create outputScript for scriptHash address`, () => {
                    checkAddressOutputScript(scriptHashAddress, coin.networkInfo());
                });
            }

            if (coinCases.bech32) {
                it(`Can create Bech32 SegWit address`, () => {
                    witnessAddress = privateCoin.getPublicKey().toAddress(Coin.Key.AddressFormat.BECH32).toString();
                    assert.strictEqual(witnessAddress, coinCases.bech32);
                });

                it(`Can create outputScript for Bech32 SegWit address`, () => {
                    checkAddressOutputScript(witnessAddress, coin.networkInfo());
                });
            }
        });
    }
});
