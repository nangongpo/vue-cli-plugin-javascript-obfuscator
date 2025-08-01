module.exports = api => {
  api.extendPackage({
    devDependencies: {
      'javascript-obfuscator': '^4.0.0' // Automatically add version 4.x
    }
  })
}
