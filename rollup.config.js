// import svelte from "rollup-plugin-svelte";
// import resolve from "rollup-plugin-node-resolve";
// import commonjs from "rollup-plugin-commonjs";
// import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import html from 'rollup-plugin-bundle-html';
import sass from 'rollup-plugin-sass';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/main.ts",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "public/bundle.js"
    },
    plugins: [
        typescript(),
        html({
            template: 'src/index.html',
            dest: 'public'
        }),
        sass({
            output: true,
        })
    ],
    watch: {
        // include: 'src/**/*'
    }
};
