const path = require( 'path');
const open = require('open');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config');
const config = require('config');
const fs = require('fs');
const https = require('https');


const compiler = webpack(webpackConfig);
const app = express();
const host = process.env.HOST || config.get("host") || 'localhost';
const port = config.get("port") || 443;
const url = 'https://' + host + ":" + port + '/';

app.use(express.static(__dirname + '/'));

const serverOptions = {
  publicPath: webpackConfig.output.publicPath,
  noInfo: true,
  stats: 'errors-only'
};

app.use(webpackMiddleware(compiler, serverOptions));
app.use(webpackHotMiddleware(compiler));

app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

let key = fs.readFileSync('/SSL/bluechilli.com.key');
let cert = fs.readFileSync('/SSL/bluechilli.com.pem');


let httpsServer = https.createServer({
  key: key, cert: cert
}, app);


httpsServer.listen(port, function onStart(err) {
  if (err) {
    console.log(err);
  }
  //open(url);
  console.info('Listening to => %s in your browser.', url);
});