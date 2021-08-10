const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/browserEnv.js',
    mode: 'development',
    output: {
        filename: './just-output.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'jo',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
            },
        ],
    },
};
