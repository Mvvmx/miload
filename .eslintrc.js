module.exports = {
  root: true,
  extends: 'standard',
  globals: {
    "window": true,
    "ActiveXObject": true,
    // mocha BDD
    describe: true,
    context: true,
    it: true,
    specify: true,
    before: true,
    beforeEach: true,
    after: true,
    afterEach: true
  },
  "env": {
    "browser": true
  },
  "rules": {
    // enable additional rules
    // "indent": ["error", 4],
    // "linebreak-style": ["error", "unix"],
    // "quotes": ["error", "double"],
    "semi": [0, "always"],
    "eqeqeq": [0, "always"],
    "one-var": [0, "always"],
    "camelcase": [0, "always"]
  }

}
