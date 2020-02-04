import typescript from "rollup-plugin-typescript2";
import html from 'rollup-plugin-bundle-html';
import sass from 'rollup-plugin-sass';
import { string } from "rollup-plugin-string";
import resolve from 'rollup-plugin-node-resolve';

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
        string({
            include: ['src/shaders/*.frag', 'src/shaders/*.vert']
        }),
        resolve(),
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
