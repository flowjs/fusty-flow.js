require('babel-polyfill');

var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.BannerPlugin(
      'MIT Licensed\n' +
      'http://github.com/flowjs/fusty-flow.js\n' +
      'Aidas Klimas'
    )
  ]
};