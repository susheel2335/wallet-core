import assert from 'assert';
import BigNumber from 'bignumber.js';
import * as plark from '../../';

describe('Utils tests', () => {

    const Utils = plark.Utils;
    const bufferControlString = 'What a Fuck???';
    const controlHex = '576861742061204675636b3f3f3f';

    describe('Method hexToBuffer', () => {
        it('Empty', () => {
            assert.ok(
                new Buffer('').equals(Utils.hexToBuffer('0x'))
            );
        });

        it('Equals control string', () => {
            assert.ok(
                new Buffer(bufferControlString).equals(Utils.hexToBuffer('0x' + controlHex))
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

        it('FF string value', () => {
            assert.strictEqual(
                Utils.addHexPrefix(controlHex),
                '0x' + controlHex,
                'Can not use it!'
            );
        });

        it('FF value from Buffer', () => {
            const buffer = new Buffer(bufferControlString);

            assert.strictEqual(
                Utils.addHexPrefix(buffer),
                '0x' + controlHex,
                'Can not use it!'
            );
        });
    });

    describe('Method isHexValid', () => {
        it('Empty', () => {
            assert.ok(
                Utils.isHexValid('', null, 0),
                'Empty HEX – is a HEX too'
            );
        });

        it('Only 0x prefix', () => {
            assert.ok(
                Utils.isHexValid('0x', null, 1),
                'Prefix 0x is a HEX, but empty HEX'
            );
        });
    });


    describe('Method fee2Sat', () => {
        it('1024 per KB', () => {
            const initialValue = new BigNumber(0.00001024).div(1024);

            assert.strictEqual(Utils.fee2Sat(initialValue), 1);
        });

        it('128 per KB', () => {
            const initialValue = new BigNumber(0.00000128).div(1024);

            assert.strictEqual(Utils.fee2Sat(initialValue), 1);
        });

        it('2047 per KB', () => {
            const initialValue = new BigNumber(0.00002047).div(1024);

            assert.strictEqual(Utils.fee2Sat(initialValue), 2);
        });
    });
});