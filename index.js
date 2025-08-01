const JavascriptObfuscatorPlugin = require('./plugin.js')

module.exports = (api, options = {}) => {
  api.chainWebpack((config) => {
    const pluginOptions = options.pluginOptions?.javascriptObfuscator || {}

    const pluginInstance = new JavascriptObfuscatorPlugin(options)

    config.plugin('javascript-obfuscator').use(pluginInstance, [pluginOptions])
  })
}
