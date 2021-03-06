const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/main.js',
  mode: 'development',
  output: {
    filename: './just-output.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'jo',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'

        }
      },
      { test: /underscore/, loader: 'expose-loader?_' }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
        "_": "underscore"
    })
  ],
  node: {
    fs: 'empty'
  }
};