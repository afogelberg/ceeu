module.exports = {
  entry: [
    './ceeu.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: false,
          presets: [
            ['@babel/preset-env', {
              targets: {
                browsers: ['ie >= 11']
              },
              modules: false,
              useBuiltIns: 'usage'
            }]
          ],
          plugins: [
            ['@babel/plugin-transform-runtime', {
              regenerator: true
            }]
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  }
};
