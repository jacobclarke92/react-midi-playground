var fs = require('fs');
var path = require('path');
var https = require('https');
var express = require('express');

// other dependencies
// var webpack = require('webpack');
// var config = require('./webpack.config');

// https config
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// server init
var app = express();

// use webpack-dev-middleware
// app.use(require('webpack-dev-middleware')(webpack(config), {
//     noInfo: true,
//     publicPath: config.output.publicPath
// }));

// serve static files
app.use(express.static('./'));

// init local secure server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3000);