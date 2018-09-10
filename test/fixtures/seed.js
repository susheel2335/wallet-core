import BIP39 from 'bip39';

const mnemonicSeed = 'flag output rich laptop hub lift list scout enjoy topic sister lab';
export const seed = BIP39.mnemonicToSeed(mnemonicSeed);
