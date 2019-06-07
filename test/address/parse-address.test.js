import assert from 'assert';
import { Coin } from '../../';

const coinAddresses = {
    [Coin.Unit.BTC]: [
        {
            addr: '1AB4n3YpcDoGP2tRPbwtCzHvfzxGXd49G1',
            equal: [Coin.Key.AddressFormat.P2PKH, '64a071b966acdbd02d095b2903b09e8575038a0a']
        },
        {
            addr: '3LSLXej3K2GrUzh5q5EdxvQfhCVJGcmGga',
            equal: [Coin.Key.AddressFormat.P2SH, 'cda3ae6f7aea7bac11d60e1a30735003aeb51213']
        },
        {
            addr: 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej',
            equal: [Coin.Key.AddressFormat.BECH32, '701a8d401c84fb13e6baf169d59684e17abd9fa216c8cc5b9fc63d622ff8c58d']
        }
    ],
    [Coin.Unit.BTCt]: [
        {
            addr: 'mh6Wdx99ZgxFqzVReKHCc4pZQRvTK75xJ6',
            equal: [Coin.Key.AddressFormat.P2PKH, '1150d9e4f52053df7b17da3611692dab24ea99ed']
        },
        {
            addr: '2MxNGc4k98cUDigJADnfYF7sLZS4rGnRYS1',
            equal: [Coin.Key.AddressFormat.P2SH, '382db9a33b6f711a2bec6b0ab676bc4e7a4945f6']
        }
    ],
    [Coin.Unit.LTC]: [
        {
            addr: 'LTzccXQ7PV5szpRZY7VPdF2EZBgRGE2Khe',
            equal: [Coin.Key.AddressFormat.P2PKH, '6033525cc8a6f3e9bf8fba39ecefa654578cec8c']
        },
        {
            disabled: true,
            addr: '35B6pKFyp5qwkhJ5AQ9keSB981jkTxUw9g',
            equal: [Coin.Key.AddressFormat.P2SH, '26381bc24c4494c6c56a4256c6ffb03d640e76b4']
        },
        {
            addr: 'MBPF8CfwmChNZCZyGH96U5RYSiLCSiaXpe',
            equal: [Coin.Key.AddressFormat.P2SH, '26381bc24c4494c6c56a4256c6ffb03d640e76b4']
        }
    ],
    [Coin.Unit.DASH]: [
        {
            addr: 'XjxdR19JcdmfUiLQKKh6ajimSCeTWhjfrJ',
            equal: [Coin.Key.AddressFormat.P2PKH, '65b56bdc3dd21df46e274c16b57876ac60b68365']
        }
    ]
};

describe('Parse address', () => {
    it('Exists parse function', () => {
        assert.strictEqual(typeof Coin.parseAddressByCoin, 'function');
    });

    for (const cn in coinAddresses) {
        const cases = coinAddresses[cn];

        describe(`Parse ${cn} addresses`, () => {
            for (const i in cases) {
                let address, error;
                const addrCase = cases[i];
                if (addrCase.disabled) {
                    continue;
                }

                describe(`Case ${i}: ${addrCase.addr}`, () => {
                    try {
                        address = Coin.parseAddressByCoin(cn, addrCase.addr);
                    } catch (e) {
                        error = e;
                    }

                    it('Parse address', () => {
                        if (!address) {
                            throw error;
                        }
                    });

                    if (!address) {
                        return;
                    }

                    it('Check address format', () => {
                        assert.strictEqual(address.getFormat(), addrCase.equal[0]);
                    });

                    it('Check address HEX', () => {
                        assert.strictEqual(address.getData().toString('hex'), addrCase.equal[1]);
                    });

                    it('Build address string back', () => {
                        assert.strictEqual(address.toString(), addrCase.addr);
                    });
                });
            }
        });
    }
});