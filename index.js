const JavascriptObfuscatorPlugin = require('./plugin.js')

module.exports = (api, options = {}) => {
  api.chainWebpack((config) => {
    const pluginOptions = options.pluginOptions?.javascriptObfuscator

    if (!pluginOptions) return

    const pluginInstance = new JavascriptObfuscatorPlugin(pluginOptions)

    config.plugin('javascript-obfuscator').use(pluginInstance, [pluginOptions])
  })
}
