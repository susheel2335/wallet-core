const PURPOSE = 44;

export enum AddressType {
    RECEIVE = 0,
    CHANGE = 1
}

export function getHDPath(coinType: number,
                          accountIndex: number,
                          addressType: AddressType = AddressType.RECEIVE,
                          index: number = 0,
): string {
    return `m/${PURPOSE}'/${coinType}'/${accountIndex}'/${addressType}/${index}`;
}


export function getAccountHDPath(coinType: number, accountIndex: number): string {
    return `m/${PURPOSE}'/${coinType}'/${accountIndex}'`;
}


export function getHDPathFromAccount(addressType: AddressType = AddressType.RECEIVE, index: number = 0): string {
    return `${addressType}/${index}`;
}
