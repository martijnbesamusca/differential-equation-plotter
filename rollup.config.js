
import svelte from 'rollup-plugin-svelte';
import sveltePreprocessor from "svelte-preprocess"
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';
// import { postcss, typescript } from 'svelte-preprocess'

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'DoDeP',
        file: 'public/bundle.js',
    },
    plugins: [
        svelte({
            preprocess: sveltePreprocessor({
                typescript: {
                    tsconfigFile: 'tsconfig.json'
                }
            }),
            css: css => {
                css.write('public/bundle.css')
            },

        }),
        typescript({tsconfigFile: 'tsconfig.json'}),
        resolve(),
        commonjs(),

        !production && livereload('public'),
        production && terser(),
    ]
}
