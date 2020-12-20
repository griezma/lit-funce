import resolve from "@rollup/plugin-node-resolve"

export default [{
    input: 'lit-html',
    output: {
        file: 'lib/lit-html.js',
        format: 'es'
    },
    plugins: [resolve()]
}, {
    input: 'lit-html/directives/style-map',
    output: {
        file: 'lib/lit-html/directives/style-map.js',
        format: 'es'
    },
    plugins: [resolve()]
}]