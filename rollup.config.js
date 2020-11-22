import resolve from "@rollup/plugin-node-resolve"
import { terser } from 'rollup-plugin-terser';

export default [{
    input: 'lit-html',
    output: [{
        file: 'lib/lit-html.js',
        format: 'es'
    }, {
        file: 'lib/lit-html.min.js',
        format: 'es',
        plugins: [terser()]
    }],
    plugins: [resolve()]
}]