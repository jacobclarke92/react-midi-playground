var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var express = require('express');

// server init
var app = express();
app.use(express.static('./'));

try {

	// check if ssl certificate files exist
	fs.accessSync('key.pem', fs.F_OK);
	fs.accessSync('cert.pem', fs.F_OK);

	// https config
	var privateKey  = fs.readFileSync('key.pem', 'utf8');
	var certificate = fs.readFileSync('cert.pem', 'utf8');
	var credentials = {
		key: privateKey, 
		cert: certificate,
	    requestCert: false,
	    rejectUnauthorized: false
	};

	// init local secure server
	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(3000, function() {
		console.log('HTTPS server started at port 3000')
	});

} catch(e) {
	console.log('Unable to start https server.', e);
}

try {

	var httpServer = http.createServer(app);
	httpServer.listen(8080, function() {
		console.log('HTTP server started at port 8080');
	});

} catch(e) {
	console.log('Unable to start http server.', e);
}