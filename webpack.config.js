const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: './just-output.js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this',
        library: {
            name: 'jo',
            type: 'umd',
        },
    },
};
