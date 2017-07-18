var config = require("config");
var fs = require('fs');
var path = require("path");

// This will take the config based on the current NODE_ENV and save it to 'build/client.json'
// Note: If '/build' does not exist, this command will error; alternatively, write to '/config'.
// The webpack alias below will then build that file into the client build.
fs.writeFileSync(path.resolve(__dirname, '../../config/client.json'), JSON.stringify(config));

module.exports = {
  extensions: ['.js', '.jsx', '.tsx', '.ts'],
  alias: {
    config: path.resolve(__dirname, 'build/client.json')
  }
}