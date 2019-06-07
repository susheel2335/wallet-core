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
        commonjs({
            include: [
                /node_modules/
            ],
        }),
    ]
}
