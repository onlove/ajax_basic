/**
 * Created by DT274 on 2018/3/1.
 */
var http = require('http');
var url = require('url');
var fs = require('fs');

var getFile = function(path, response) {
    fs.readFile(path, function(err, data) {
        if (err) {
            response.writeHead(404);
            response.end('not found');
        } else {
            response.end(data);
        }
    })
};

var server = http.createServer(function(req, res) {
    var params = url.parse(req.url, true);
    if (params.pathname == '/ajax') {
        res.write('hello word');
        res.end()
    }else {
        console.log(params.pathname);
        getFile('..' + params.pathname, res);
       // res.end('not supported')
    }
});

//商品最大值65535
server.listen(3000, function () {
    console.log('start at 3000')
});