import assert from 'assert';
import * as plark from '../../lib';

describe('Utils.Crypto tests', () => {

    const Crypto = plark.Utils.Crypto;
    const bufferControlString = new Buffer('What a Fuck???');

    it('Test SHA1', () => {
        assert.strictEqual(
            Crypto.sha1(bufferControlString).toString('hex'),
            'efa49d805c0248b84d953697f3e44a7efeebc861',
        );
    });

    it('Test SHA256', () => {
        assert.strictEqual(
            Crypto.sha256(bufferControlString).toString('hex'),
            '64aceec7a79d062a67b3cae0e82daac534ab8bb01ad455a00ea0356d661a36f4',
        );
    });

    it('Test Double HASH256', () => {
        assert.strictEqual(
            Crypto.doubleHash256(bufferControlString).toString('hex'),
            '63d449a1d356fb3e5cf7fb4ac73ebffc4afc7767b125231c0b04ff0f098c4d29',
        );
    });

    it('Test HASH160', () => {
        assert.strictEqual(
            Crypto.hash160(bufferControlString).toString('hex'),
            '5acb89ca5d84f8b34815c0ce8be555c1f1362c72',
        );
    });

    it('Test RIPEMD160', () => {
        assert.strictEqual(
            Crypto.ripemd160(bufferControlString).toString('hex'),
            '6fe222431e26c2a59c379f04dde8e3ecd3db3cbb',
        );
    });
});
