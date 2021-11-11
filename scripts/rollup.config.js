import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from '../package.json';
import {terser} from "rollup-plugin-terser";
export default [{
    input: 'index.js',
    output: {
        dir: './dist',
        format: 'es',
    },
    plugins: [
        nodeResolve(),
        terser()
    ],
    external: [
        ...Object.keys(pkg.dependencies || {})
    ]
}];