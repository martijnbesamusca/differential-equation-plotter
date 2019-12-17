// const webpack = require("webpack");
// const pkg = require("./package.json");
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  /* ... other config ... */
  transpileDependencies: ["vuex-persist"],
  lintOnSave: true,
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: 'public',
        to: 'dist',
        ignore: ["index.html", ".DS_Store" ]
      }])
    ]
  },
};
