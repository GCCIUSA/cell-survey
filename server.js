// modules
var nodeStatic = require('node-static'),
    port = 8080,
    http = require('http');

// config
var file = new nodeStatic.Server(__dirname, {
    cache: 3600,
    gzip: true
});

// serve
http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
} ).listen(port);

console.log('Listening on port ' + port);