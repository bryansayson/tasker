var express = require('express');
var app = express();
var path = require('path');

process.env.PWD = process.cwd();

app.set('views', path.join(process.env.PWD, 'public'));

app.use(express.static(path.join(process.env.PWD, 'public')));

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
