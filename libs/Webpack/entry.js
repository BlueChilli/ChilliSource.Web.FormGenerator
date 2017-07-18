var path = require('path');

const devEntry = [
  '../../../app/webpack-hot-middleware/client',
  path.join(__dirname, '/app/entry.tsx')
]

const prodEntry = [
]

module.exports = (environment) => {
  if (environment === "development"){
    return devEntry;
  } else {
    return prodEntry;
  }
}