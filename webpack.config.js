/* eslint-disable */

var webpack = require('webpack');

module.exports = {
  entry: __dirname + '/src/index',
  output: {
    path: `${__dirname}/bundles`,
    filename: 'redone.js',
    library: 'Redone',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compressor: {
        warnings: false,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        ]
      }
    ]
  }
};
