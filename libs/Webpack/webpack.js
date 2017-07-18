var rules = require("./rules");
var getPlugins = require("./plugins");
var resolve = require("./resolve");
var getOutput = require("./output");
var path = require('path');

const prodEntry = [
    './app/entry.tsx'
]

const devEntry = prodEntry.concat(['webpack-hot-middleware/client?dynamicPublicPath=true']);


module.exports = {
  devtool: process.env.EXE_ENV === 'production' ? false : 'eval-source-map',
  entry:  process.env.EXE_ENV === 'production' ? prodEntry : devEntry,
  output: getOutput(process.env.EXE_ENV),
  module: {
    rules
  },
  plugins: getPlugins(process.env.NODE_ENV, process.env.EXE_ENV),
  resolve
};
