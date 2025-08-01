# vue-cli-plugin-javascript-obfuscator

A Vue CLI plugin to automatically obfuscate JavaScript files using `javascript-obfuscator@4.x`.

## Installation

To install the plugin, run the following command:

```
vue add javascript-obfuscator
```


## Configuration

After installing the plugin, you can configure it in your vue.config.js file under the pluginOptions field.

Example Configuration:
```
// vue.config.js

module.exports = {
  pluginOptions: {
    javascriptObfuscator: {
      // Files to include in obfuscation (can be a string or an array of strings/regex patterns)
      includes: [
        'app.*.js',
        '**/chunk-libs.*.js',  // Matches chunk-libs files for obfuscation
      ],

      // Options for the javascript-obfuscator
      obfuscatorOptions: {
        compact: true,  // Minify the code
        disableConsoleOutput: false,  // Keep console output
        rotateStringArray: true,  // Rotate the string array during obfuscation
        identifierNamesGenerator: 'hexadecimal',  // Use hexadecimal naming for identifiers
        selfDefending: true,  // Make the obfuscated code harder to read
      },
    },
  },
};
```
