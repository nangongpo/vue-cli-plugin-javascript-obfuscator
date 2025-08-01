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
  constructor({ includes = [], excludes = [], obfuscatorOptions = {} } = {}) {
    this.includes = Array.isArray(includes) ? includes : [includes]
    this.excludes = Array.isArray(excludes) ? excludes : [excludes]
    this.obfuscatorOptions = obfuscatorOptions
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'JavascriptObfuscatorPlugin',
      async (compilation, callback) => {
        const promises = []

        for (const assetName of Object.keys(compilation.assets)) {
          // Include filter
          if (
            this.includes.length &&
            !micromatch.isMatch(assetName, this.includes)
          ) {
            continue
          }

          // Exclude filter
          if (micromatch.isMatch(assetName, this.excludes)) {
            console.log(`Skipping obfuscation for: ${assetName}`)
            continue
          }

          console.log(`Obfuscating: ${assetName}`)
          const asset = compilation.assets[assetName]

          promises.push(
            new Promise((resolve, reject) => {
              try {
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(
                  asset.source(),
                  {
                    compact: true,
                    disableConsoleOutput: false,
                    rotateStringArray: true,
                    identifierNamesGenerator: 'hexadecimal',
                    selfDefending: true,
                    ...this.obfuscatorOptions
                  }
                ).getObfuscatedCode()

                compilation.assets[assetName] = {
                  source: () => obfuscatedCode,
                  size: () => obfuscatedCode.length
                }

                resolve()
              } catch (err) {
                console.error(`Failed to obfuscate ${assetName}:`, err)
                reject(err)
              }
            })
          )
        }

        await Promise.all(promises)
        callback()
      }
    )
  }
}

module.exports = JavascriptObfuscatorPlugin
