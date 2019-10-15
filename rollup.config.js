import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './src/index.ts',
    output: {
        file: './lib/bundle.js',
        format: 'cjs'
    },

    plugins: [
        typescript(/*{ plugin options }*/),
        json(),
        commonjs({
            include: [
                /node_modules/
            ],
        }),
    ]
}
