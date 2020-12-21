import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";


export default [{
    input: './lit-html-bundle.js',
    output: {
        file: 'lib/lit-html.js',
        format: 'es',
        plugins: [terser()]
    },
    plugins: [resolve()]
}]