import * as Plark from '../';

describe('Existing modules', () => {
    it('HD', (done) => {
        if ('HD' in Plark) {
            done();
        }
    });

    it('Coin', (done) => {
        if ('Coin' in Plark) {
            done();
        }
    });

    it('Constants', (done) => {
        if ('Constants' in Plark) {
            done();
        }
    });

    it('Networking', (done) => {
        if ('Networking' in Plark) {
            done();
        }
    });

    it('Utils', (done) => {
        if ('Utils' in Plark) {
            done();
        }
    });

    it('Wallet', (done) => {
        if ('Wallet' in Plark) {
            done();
        }
    });
});