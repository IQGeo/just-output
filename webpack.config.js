import path from 'path';

export const entry = './src/main.js';
export const output = {
    filename: './cjs/just-output.js',
    path: path.resolve('./dist'),
    globalObject: 'this',
    library: {
        name: 'jo',
        type: 'umd',
    },
};

export default { entry, output };
