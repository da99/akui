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
var LIST_KEY = 'Akui.RESULTS';
var STATUS_KEY = 'Akui.STATUS';

process.on('exit', function () {
  client.quit(function () {
    console['log']('Redis client quit successfully.');
  });
});

function has_fails(report) {
  return !!_.find(report, function (results, filename) {
    return results.fail.length > 0;
  });
}
function clear_results(done) {
  read_results(function (results, is_fin) {
    update_status('waiting', function () {
      done(results, is_fin);
    });
  });
};

function read_status(func) {
  client.get(STATUS_KEY, function (err, reply) {
    if (err) throw err;
    if (func)
      func(reply);
  });
}

function update_status(val, func) {
  client.set(STATUS_KEY, val, function (err, reply) {
    if (err) throw err;
    if (func)
      func(reply);
  });
}

function read_results(done) {
  var results = [];
  var push = function (id, result) {
    if (id) {
      results.push([id, result]);
      pop(push);
    } else {

      read_status(function (stat) {
        done(results, stat === 'fin', stat);
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
      done(id, JSON.parse(result));
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
    if (process.env.TEST_FILE)
      return file.indexOf(process.env.TEST_FILE) === 0;
    else
      return file.match(/^[0-9]+\-/);
  }).sort();
}

module.exports = function (test_dir) {

  clear_results(function () { });

  var files = read_file_list(test_dir);
  var has_started = false;

  return function (req, resp, next) {
    if (!has_started && req.method === 'GET') {
      has_started = true
      update_status('started');
    }


    if (req.url === '/akui_tests/report' && req.method === 'POST') {
      write_result(req.body, function () {
        if (!files.length)
          update_status('fin');
        if (has_fails(req.body)) {
          files = [];
          update_status('fin');
        }
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

      read_status(function (stat) {
        resp.json({success:true, code: contents, test_id: next_file, is_fin: stat === 'fin', akui_status: stat});
      });
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

var timeout     = 250;
var last        = 0;
var stop_stream = false;
var to_shown    = false;
var stream_results = module.exports.stream_results = function (stream) {

  if (stop_stream)
    return;

  read_results(function (results, is_fin, stat) {
    var now = (new Date).getTime();

    if (stat === 'waiting') {
      last = now;
    }

    var any = results.length !== 0;

    if (any) {
      stream(results, is_fin, stat);
      to_shown = false;
    }

    if (!any && stat === 'started' && ((now - last) > (timeout * 10))) {
      if (!to_shown)
        stream('timeout');
      to_shown = true;
    }

    setTimeout( function () {  stream_results(stream); }, timeout );
  });
};

var quit = module.exports.quit = function (func) {
  stop_stream = true;
  client.quit(func || function () { process.exit(); });
};


if (process.argv.indexOf(__dirname + '/app.js') > -1) {

  var home_page = fs.readFileSync('public/_index.html').toString();

  process.on('SIGINT', quit);
  process.on('SIGTERM', quit);
  var app = express();

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.cookieSession({secret: (new Date).getTime() + '' + parseInt(Math.random() * 10000)}));
  app.use(express.csrf());

  app.use(module.exports('tests'));
  app.use(function (req, resp, next) {
    if (req.url === '/' && req.method === 'GET')
      resp.send(home_page.replace('{{_csrf}}', req.session._csrf));
    else
      next();
  });
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


