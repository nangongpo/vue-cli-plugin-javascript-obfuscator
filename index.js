// @ts-nocheck
const JavaScriptObfuscator = require('javascript-obfuscator')

module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    // Get user-configured options from vue.config.js
    const opts = options.pluginOptions && options.pluginOptions.javascriptObfuscator

    // Default values for the plugin options
    const assetsDir = opts.assetsDir || 'static'
    const includes = Array.isArray(opts.includes)
      ? opts.includes
      : [opts.includes || []]
    const excludes = Array.isArray(opts.excludes)
      ? opts.excludes
      : [opts.excludes || []]
    const obfuscatorOptions = opts.obfuscatorOptions || {}

    const JavascriptObfuscatorPlugin = {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync(
          'JavascriptObfuscatorPlugin',
          async (compilation, callback) => {
            const promises = []

            // Generate regex patterns from includes and excludes
            const includePatterns = includes.map((pattern) =>
              typeof pattern === 'string'
                ? new RegExp(pattern.replace('static', assetsDir))
                : pattern
            )
            const excludePatterns = excludes.map((pattern) =>
              typeof pattern === 'string'
                ? new RegExp(pattern.replace('static', assetsDir))
                : pattern
            )

            Object.keys(compilation.assets).forEach((assetName) => {
              // Skip assets that don't match the include or match any of the exclude patterns
              if (
                includePatterns.length &&
                !includePatterns.some((pattern) => pattern.test(assetName))
              ) {
                return
              }

              if (excludePatterns.some((pattern) => pattern.test(assetName))) {
                console.log(`Skipping obfuscation for: ${assetName}`)
                return
              }

              console.log(`Obfuscating: ${assetName}`)
              const asset = compilation.assets[assetName]
              promises.push(
                new Promise((resolve, reject) => {
                  try {
                    const obfuscated = JavaScriptObfuscator.obfuscate(
                      asset.source(),
                      {
                        compact: true,
                        disableConsoleOutput: false,
                        rotateStringArray: true,
                        identifierNamesGenerator: 'hexadecimal',
                        selfDefending: true,
                        ...obfuscatorOptions // Spread any additional options
                      }
                    ).getObfuscatedCode()

                    compilation.assets[assetName] = {
                      source: () => obfuscated,
                      size: () => obfuscated.length
                    }

                    resolve()
                  } catch (err) {
                    console.error(`Failed to obfuscate ${assetName}:`, err)
                    reject(err) // Reject if there's an error in obfuscation
                  }
                })
              )
            })

            // Wait for all files to be processed
            await Promise.all(promises)
            callback()
          }
        )
      }
    }
    // Instantiate and apply the plugin to the Webpack config
    config.plugin('javascript-obfuscator').use(JavascriptObfuscatorPlugin)
  })
}
