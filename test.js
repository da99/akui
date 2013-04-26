var express = require('express');
var app = express();

var ui_test = require('./app');

app.use(express.logger('dev'));

app.use(express.static(__dirname));

ui_test.route(app);

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(5000);
