declare module 'create-hash' {

    type HashAlgorithm = 'sha1' | 'sha256' | 'sha224' | 'md5' | 'ripemd160' | 'rmd160';

    interface Hash {
        write(payload: string | Buffer): Hash;

        update(payload: string | Buffer): Hash;

        digest(): Buffer;
    }

    function createHash(hashAlgorithm: HashAlgorithm): Hash;

    export default createHash;
}
