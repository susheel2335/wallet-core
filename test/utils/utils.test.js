import assert from 'assert';
import * as plark from '../../';

describe('Utils tests', () => {

    const Utils = plark.Utils;
    const bufferControlString = 'What a Fuck???';
    const controlHex = '576861742061204675636b3f3f3f';

    describe('Method hexToBuffer', () => {
        it('Empty', () => {
            assert.ok(
                new Buffer('')
                    .equals(Utils.hexToBuffer('0x'))
            );
        });

        it('Equals control string', () => {
            assert.ok(
                new Buffer(bufferControlString)
                    .equals(Utils.hexToBuffer('0x' + controlHex))
            );
        });
    });

    describe('Method addHexPrefix', () => {
        it('Empty', () => {
            assert.strictEqual(Utils.addHexPrefix(''), '0x');
        });

        it('Empty Buffer', () => {
            assert.strictEqual(Utils.addHexPrefix(new Buffer('')), '0x');
        });

        it('FF string value', (done, reject) => {
            if ('0x' + controlHex !== Utils.addHexPrefix(controlHex)) {
                throw new Error('Can not use it!');
            }

            done();
        });

        it('FF value from Buffer', (done, reject) => {
            const buffer = new Buffer(bufferControlString);
            if ('0x' + controlHex !== Utils.addHexPrefix(buffer)) {
                throw new Error('Can not use it!');
            }

            done();
        });
    });

    describe('Method isHexValid', () => {
        it('Empty', (done, reject) => {
            if (false === Utils.isHexValid('', null, 0)) {
                throw new Error('Empty HEX - is a HEX too');
            }

            done();
        });

        it('Only 0x prefix', (done, reject) => {
            if (false === Utils.isHexValid('0x', null, 1)) {
                throw new Error('Prefix 0x is a HEX, but empty HEX');
            }

            done();
        });
    });
});