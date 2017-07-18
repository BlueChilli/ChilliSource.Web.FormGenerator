var path = require('path');

const devOutput = {
  path: "/",
  publicPath: "/"
}

const prodOutput = {
  path: path.join(__dirname,  "/build/"),
  filename: "[name].js?q=[hash]",
  chunkFilename: "[name].js?q=[hash]",
  publicPath: "/"
}

module.exports = (executionEnvironment) => {
  if (executionEnvironment === "development"){
    return devOutput;
  } else {
    return prodOutput;
  }
}