var BIP39 = require('bip39');

var mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
var seed = BIP39.mnemonicToSeed(mnemonicSeed);

module.exports = {
    seed: seed
};
