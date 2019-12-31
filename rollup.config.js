
import svelte from 'rollup-plugin-svelte';
import sveltePreprocessor from "svelte-preprocess"
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/main.ts',
    output: {
        name: 'DoDeP',
        sourcemap: true,
        format: 'iife',
        file: 'public/bundle.js',
    },
    plugins: [
        // typescript({tsconfigFile: 'tsconfig.json'}),
        svelte({

            dev: process.env.NODE_ENV === "development",
            extensions: [".svelte"],
            preprocess: sveltePreprocessor(),

            css: css => {
                css.write('public/bundle.css')
            },

        }),
        resolve(),
        commonjs(),

        !production && livereload('public'),
        production && terser(),
    ]
}
