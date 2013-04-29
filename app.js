var _         = require('underscore')
, Redis       = require('redis')
, fs          = require('fs')
, path        = require('path')
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
var LIST_KEY = 'akui_results';
var first_run = true;

process.on('exit', function () {
  client.quit(function () {
    console['log']('Redis client quit successfully.');
  });
});

function clear_results(done) {
  read_results(done);
};

function read_results(done) {
  var results = [];
  var push = function (id, result) {
    if (id) {
      results.push([id, result]);
      pop(push);
    } else {

      client.get('Akui.STATUS', function (err, reply) {
        if (err) throw err;
        done(results, reply === 'fin');
      });
    }
  };
  pop(push);
}

function pop(done) {
  client.lpop(LIST_KEY, function (err, id) {
    if (err) throw err;
    if (!id)
      return done();

    client.get(id, function (err, result) {
      if (err) throw err;
      done(id, result);
    });
  });
}

function write_result(result, done) {
  var pairs = _.pairs(result);
  var waits = pairs.slice();
  _.each(pairs, function (p, i) {
    var id = p[0];
    var r  = p[1];
    if (r.toString().trim() === '') {
        waits.shift();
      return;
    }
    client.rpush(LIST_KEY, id, function (err, replys) {
      if (err) throw err;
      client.set(id, JSON.stringify(r), function (err, replys) {
        if (err) throw err;
        waits.shift();
        if (!waits.length)
          done();
      });
    });
  });
}

function read_file_list(dir) {
  return _.select(fs.readdirSync(dir), function (file, i) {
    return file.match(/^[0-9]+\-/);
  }).sort();
}

module.exports = function (test_dir) {

  var files = read_file_list(test_dir);

  return function (req, resp, next) {
    if (req.url === '/akui_tests/report' && req.method === 'POST') {
      write_result(req.body, function () {
        console['log']("AKUI: results saved.");
        resp.json({success: true});
      });
      return;
    }

    if (req.url === '/akui_tests/report' && req.method === 'GET') {
      read_results(function (results) {
        resp.json(results)
      });
      return;
    }

    if (req.url === '/akui_tests/next' && req.method === 'GET') {
      var next_file = files.shift();
      var contents = (next_file) ? fs.readFileSync(path.join(test_dir, next_file)).toString() : null;

      if (contents) {
        client.set('Akui.STATUS', 'start', function (err, reply) {
          if (err) throw err;
        });
      } else {
        client.set('Akui.STATUS', 'fin', function (err, reply) {
          if (err) throw err;
        });
      }

      var fin = function () {
        resp.json({success:true, code: contents, test_id: next_file});
      };

      if (first_run) {
        first_run = false;
        read_results(fin);
        return;
      }

      fin();
      return;
    }

    if (req.url.indexOf('/akui_tests') === 0 || req.url === '/favicon.ico') {
      req.url = req.url.replace('/akui_tests', '');
      return static(req, resp, next);
    }
    next();
  };

}; // === init

module.exports.clear_results = clear_results;
module.exports.read_results  = read_results;

var timeout    = 250;

var stream_results = module.exports.stream_results = function (stream) {
  read_results(function (results, is_fin) {
    var any = results.length !== 0;

    if (any)
      stream(results, is_fin);

    setTimeout( function () {  stream_results(stream); }, timeout );
  });
};

var quit = module.exports.quit = function (func) {
  client.quit(func || function () { process.exit(); });
};


if (process.argv.indexOf(__dirname + '/app.js') > -1) {
  process.on('SIGINT', quit);
  process.on('SIGTERM', quit);
  var app = express();
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(module.exports('tests'));
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


