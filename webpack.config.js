var path = require('path');

module.exports = {

  entry: "./src/index",
  output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bundle.js',
  },

  module: {
    loaders: [
      {
        loader: "babel-loader",

        // Skip any files outside of your project's `src` directory
        include: [
          path.join(__dirname, 'src'),
        ],

        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/,

        // Options to configure babel with
        query: {
          plugins: ['transform-runtime', 'transform-decorators-legacy'],
          presets: ['es2015', 'stage-0', 'react'],
        },

      },
    ]
  },

  resolve: {
    modulesDirectories: [
      'node_modules',
      'src',
    ]
  }
}