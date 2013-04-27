var _         = require('underscore')
, Redis       = require('redis')
, fs          = require('fs')
, express     = require('express')
;

var static = express.static(__dirname + '/public', {maxAge: 1000});
var cache = {};
var client = Redis.createClient();
client.on('error', function (err) {
  throw new Error("Redis client error: " + err);
});
var id_prefix = 'test_' + (new Date).getTime() + '_';
var test_count = 0;
var LIST_KEY = 'dom_results';

process.on('exit', function () {
  client.quit(function () {
    console['log']('Redis client quit successfully.');
  });
});

function write_result(result, done) {
  var id = id_prefix + (++test_count);
  var vals = [id].concat( _.flatten(_.pairs(result)) );
  client.hset(vals, function (err, replys) {
    if (err) throw err;
    client.rpush( LIST_KEY, id, function (err, replys) {
      if (err) throw err;
      done();
    });
  });
}

function pop(done) {
  client.lpop(LIST_KEY, function (err, reply) {
    if (err) throw err;
    done(reply);
  });
}
function read_results(done) {
  var results = [];
  pop(function (reply) {
    if (reply)
      results.push(reply);
    else
      done(results);
  });
}


module.exports = function () {

  return function (req, resp, next) {
    if (req.url === '/akui_tests/report') {
      write_result(req.data, function () {
        resp.json({success: true});
      });
      return;
    }

    if (req.url === '/akui_tests/print') {
      read_results(function (results) {
        resp.json(results)
      });
      return;
    }

    if (req.url === '/akui_tests/next') {
      resp.json({success:true})
      return;
    }

    if (req.url.indexOf('/akui_tests') === 0 || req.url === '/favicon.ico') {
      req.url = req.url.replace('/akui_tests', '');
      return static(req, resp, next);
    }
    next();
  };

}; // === init


var quit = module.exports.quit = function () {
  client.quit(function () { process.exit() });
};

process.on('SIGINT', quit);
process.on('SIGTERM', quit);

if (process.argv.indexOf(require.main.filename) > -1) {
  var app = express();
  app.use(express.logger('dev'));
  app.use(module.exports());
  app.use('/', express.static(__dirname + '/public'));
  app.use(function (err, req, resp, next) {
    console.log(err);
    resp.send(500, "Error.");
  });
  app.use(function (req, resp, next) {
    resp.send(404, "Not found. Try: <a href='/akui_tests/Tests.html'>Tests.html</a> ");
  });

  var port = process.env.PORT || 5000;
  app.listen(port, function () {
    console['log']('Listening to: ' + port);
  });
}


