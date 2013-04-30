
// ================================================================
// ================== Vars ========================================
// ================================================================


var Akui = {events: { finish: [] }, total_for_page: 0 };

Akui.reset = function () {
  Akui.report = {
    pass  : [],
    fail  : [],
    waits : [],
    all   : []
  };

  Akui.current = {
    test_name  : null,
    test_index : -1
  };

  return Akui;
};

Akui.reset();

// ================================================================
// ================== Events ======================================
// ================================================================

Akui.on = function (name, func) {
  Akui.events[name].push(func);
};

Akui.trigger = function (name) {
  _.each(Akui.events[name], function (f) {
    f();
  });
};

// ================================================================
// ================== Reporting Results ===========================
// ================================================================


Akui.pass = function (name, exp, act) { Akui.result('pass', name, exp, act); return Akui; };
Akui.fail = function (name, exp, act) {
  if (arguments.length === 2)
    Akui.result('fail', name, exp);
  else
    Akui.result('fail', name, exp, act);
  return Akui;
};

Akui.result = function (type, i_name, exp, act) {
  var args = Array.prototype.slice.apply(arguments, []);

  var test     = Akui.report.all[i_name];
  var name     = args[1] = test.name;
  test.is_fin  = true;
  test.results = args;

  Akui.report[(type === 'pass') ? type : 'fail'].push(args);

  var is_err = (arguments.length === 3) && exp.message && exp.constructor && exp.constructor === Error;
  if (is_err)
    throw exp;

  return Akui;
};


// ================================================================
// ================== Printing ====================================
// ================================================================


Akui.print = {};

Akui.print.all = function() {
  if (Akui.report.fail.length)
    console.log('Pass: ' + Akui.report.pass.length, ", Fails: " + Akui.report.fail.length);
  else if (Akui.report.pass.length > 0)
    console.log("ALL PASS.");

  _.each(Akui.report.all, function (test) {
    Akui.print.report.apply(null, [test]);
  });
}

// ================================================================
// ===     You can write over this function in your tests.      ===
// ================================================================
Akui.print.report = function(test) {
  var type = (test.results && test.results[0] ) || 'fail';
  var name = test.name;
  var exp  = test.results && test.results[2];
  var act  = test.results && test.results[3];

  function span(txt) {
    return '<span>' + (txt + '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
  }

  switch (type) {

    case 'pass':
    $('#results').append('<div class="passed">' + span(exp) + ' === ' + span(act) + '<br /> ' + name + '</div>');
    break;

    case 'fail':
    $('#results').append('<div class="failed">' + span(exp) + ' === ' + span(act) + '<br /> ' + name + '</div>');
    break;

    default:
    $('#results').append('<div class="failed">' + span(exp) + '<br /> ' + name + '</div>');
    break;

  };
};


// ================================================================
// ================== Testing =====================================
// ================================================================

Akui.test = function (name, func) {

  var hash = (window.location.hash !== '') ? window.location.hash.replace('#', '') : null;

  if (hash && name.indexOf(hash) < 0)
    return;
  Akui.total_for_page += 1;
  Akui.report.waits.push(250);
  Akui.current.test_index += 1;
  var index = Akui.current.test_index;

  var assert = function (exp, act) {
    Akui.report.waits.shift();
    var a = JSON.stringify(exp);
    var b = JSON.stringify(act);
    if (_.isEqual(exp, act))
      Akui.pass(index, a, b);
    else
      Akui.fail(index, a, b);
  };

  try {
    Akui.report.all[Akui.current.test_index] = {name: name, results: null, fin: null};
    func(assert);
  } catch (e) {
    Akui.fail(index, e);
  }

};

Akui.run = function () {
  promise.get('/akui_tests/next', {}, {"Accept": "text/plain"}).then(function (error, result) {
    var r = JSON.parse(result);
    if (error)
      throw error;

    if (r.code) {
      eval(r.code);
      Akui.current.test_id = r.test_id;
      Akui.finish();
      return;
    }

    if (!Akui.total_for_page) {
      if (r.is_fin)
        console.log('Akui server: fin');
      else
        throw new Error("Akui: no tests found.");
    }

    if (Akui.report.all.length != (Akui.report.pass.length + Akui.report.fail.length))
      throw new Error("Akui client: timeout. Tests taking too long to finish.");

    console.log("Akui client: fin");
  });
};

Akui.finish = function () {
  var win_errs = window.akui_window_errs;
  if (win_errs && win_errs.length)
    return;

  if (Akui.report.waits.length) {
    console.log('Akui: waiting to finish...');
    Akui.report.waits.sort();
    return setTimeout(Akui.finish, Akui.report.waits.shift());
  }

  var data = {};
  data[Akui.current.test_id] = (Akui.report);
  var headers = {
   'x-csrf-token': (window._csrf && typeof window._csrf === 'function') ? _csrf() : $('#_csrf').text().trim()
  };

  return fermata.json("/akui_tests/report").post(headers, data, function (err, result) {
    if (err) throw err;
    console.log('Akui report sent: ' + JSON.stringify(result));
    Akui.trigger('finish');
  });
};

// ================================================================
// ================== Showtime! ===================================
// ================================================================

Akui.run();




















