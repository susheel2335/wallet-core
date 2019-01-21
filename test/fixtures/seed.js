var BIP39 = require('bip39');

var phrase = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
var seed = BIP39.mnemonicToSeed(phrase);

module.exports = {
    phrase: phrase,
    seed: seed,
};
