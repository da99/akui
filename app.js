var _         = require('underscore')
, Redis       = require('redis')
;

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


exports.route = function (app) {

  app.post('/report_dom', function (req, resp) {
    write_result(req.data, function () {
      resp.json({success: true});
    });
  });

  app.get('/dom_report', function (req, resp) {
    read_results(function (results) {
      resp.json(results)
    });
  });

}; // === init
