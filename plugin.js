// @ts-nocheck
const JavaScriptObfuscator = require('javascript-obfuscator')
const micromatch = require('micromatch')

/**
 * Webpack plugin to obfuscate JavaScript assets using javascript-obfuscator.
 */
class JavascriptObfuscatorPlugin {
  /**
   * @param {Object} options
   * @param {string[]} [options.includes] - Glob patterns for files to include.
   * @param {string[]} [options.excludes] - Glob patterns for files to exclude.
   * @param {Object} [options.obfuscatorOptions] - Options for javascript-obfuscator.
   */
  constructor({ includes = [], obfuscatorOptions = {} } = {}) {
    this.includes = Array.isArray(includes) ? includes : includes ? [includes] : []
    this.obfuscatorOptions = obfuscatorOptions
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'JavascriptObfuscatorPlugin',
      async (compilation, callback) => {
        try {
          const assetNames = Object.keys(compilation.assets)
          const jsFiles = assetNames.filter(name => name.endsWith('.js'))
          const needObfuscateFiles = jsFiles.filter(name => {
            const included = this.includes.length ? micromatch.isMatch(name, this.includes) : false
            return included
          })

          const promises = needObfuscateFiles.map(name => {
            return new Promise((resolve, reject) => {
              try {
                const asset = compilation.assets[name]
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(
                  asset.source(),
                  this.obfuscatorOptions
                ).getObfuscatedCode()

                compilation.assets[name] = {
                  source: () => obfuscatedCode,
                  size: () => obfuscatedCode.length
                }

                console.log(`[Obfuscator] ✔ Obfuscated ${name}`)
                resolve()
              } catch (err) {
                console.error(`Failed to obfuscate ${name}:`, err)
                reject(err)
              }
            })
          })

          await Promise.all(promises)
          callback()
        } catch (error) {
          console.error(`[Obfuscator] ✖ Build failed during obfuscation:`, error)
          callback(error) // 传递错误让 Webpack 停止构建
        }
      }
    )
  }
}

module.exports = JavascriptObfuscatorPlugin
