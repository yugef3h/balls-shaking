const glob = require('glob')
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const report = process.env.npm_config_report;
const isProduction = process.env.NODE_ENV === "production"
const cdn = {
  css: [],
  js: ['https://cdn.bootcss.com/vue/2.6.11/vue.min.js', 'https://cdn.bootcss.com/vue-router/3.1.6/vue-router.min.js'],
}

function createEntry() {
  let entryObj = {}
  glob.sync('./src/pages/**/main.js').forEach(path => {
    const chunk = path.split("./src/pages/")[1].split("/main.js")[0]
    entryObj[chunk] = {
      entry: path,
      template: `public/index.html`,
      filename: `${chunk}.html`,
      chunks: ['chunk-vendors', 'chunk-common', chunk]
    }
  })
  return entryObj
}
module.exports = {
  pages: createEntry(),
  chainWebpack: config => {
    config.plugins.delete('named-chunks')
    if (isProduction) {
      // cdn + 多页面
      // 查看 vue inspect --plugins
      // e.g. html-index          
      glob.sync('./src/pages/**/main.js').forEach(path => {
        const chunk = path.split("./src/pages/")[1].split("/main.js")[0];
        config.plugin("html-" + chunk).tap(args => {
          args[0].cdn = cdn;
          return args;
        });
      });
    }
  },
  configureWebpack: config => {
    if (report) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    if (isProduction) {
      config.externals = {
        vue: "Vue",
        "vue-router": "VueRouter",
        // vuex: "Vuex",
        // 'alias-name': 'ObjName',
      };
    }
  },
  devServer: { proxy: { '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true, pathRewrite: { '^/api': '' } } } }
}