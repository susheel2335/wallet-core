// declare module 'coinselect' {
//
//     export type CoinSelectUtxo = {
//         value: number;
//         [key: string]: any;
//     };
//
//     export type CoinSelectOutput = {
//         address?: string;
//         script?: Buffer;
//         value: number;
//         [key: string]: any;
//     };
//
//     export type CoinSelectResult<I extends CoinSelectUtxo = CoinSelectUtxo, O extends CoinSelectOutput = CoinSelectOutput> = {
//         inputs?: I[];
//         outputs?: O[];
//         fee: number;
//     };
//
//     export default function coinSelect<I extends CoinSelectUtxo = CoinSelectUtxo, O extends CoinSelectOutput = CoinSelectOutput>(
//         utxos: I[],
//         outputs: O[],
//         feeRate: number,
//     ): CoinSelectResult<I, O>;
// }
