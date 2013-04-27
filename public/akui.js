
// ================================================================
// ================== Vars ========================================
// ================================================================


var Akui = {};

Akui.report = {
  pass  : [],
  fail  : [],
  all   : []
};

Akui.current = {
  test_name : null,
  test_index : -1
};

// ================================================================
// ================== Reporting Results ===========================
// ================================================================


Akui.pass = function (name, msg)  { Akui.result('pass',  name, msg); return Akui; };
Akui.fail = function (name, msg)  { Akui.result('fail',  name, msg); return Akui; };

Akui.result = function (type, name, exp, act) {
  var args = Array.prototype.slice.apply(arguments, []);

  if (Akui.report.all[name]) {
    var test = Akui.report.all[name];
    name         = args[1] = test.name;
    test.fin     = true;
    test.results = args;
  }

  Akui.report.all.push(args);
  Akui.report[(type === 'pass') ? type : 'fail'].push(args);

  var is_err = exp.message && exp.constructor && exp.constructor === Error;
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
  console.log(JSON.stringify(test))
  var type = (test.result && test.result[0] ) || 'fail';
  var name = test.name;
  var exp  = test.result && test.result[2];
  var act  = test.result && test.result[3];

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

  Akui.current.test_index += 1;
  var index = Akui.current.test_index;

  var assert = function (exp, act) {
    var a = JSON.stringify(exp);
    var b = JSON.stringify(act);
    if (_.isEqual(exp, act))
      Akui.pass(index, a, b);
    else
      Akui.fail(index, a, b);
  };


  try {
    Akui.report.waits[Akui.current.test_index] = {name: name, results: null, fin: null};
    func(assert);
  } catch (e) {
    Akui.fail(index, e, null);
  }

};

Akui.run_next = function () {
  if (!window.akui_loads)
    window.akui_loads = 0;
  window.akui_loads += 1;

  if (window.akui_loads > 10) {
    console.log('Throwing...');
    throw new Error("promise lib not found.");
    return;
  }

  if (!window.promise) {
    console.log('Waiting for promise lib to load...');
    setTimeout(Akui.run_next, 200);
    return;
  }

  window.akui_loads = 1;

  promise.get('/akui_tests/next').then(function (error, result) {
    console.log(error);
    console.log(result);
    Akui.finish();
  });
};

Akui.finish = function () {
  var total_fin = Akui.report.pass + Akui.report.fail;
  if (Akui.report.all.length && total_fin === Akui.report.all.length)
    return Akui.run_next();

  if (!window.fins)
    window.fins = 0;
  window.fins += 1;
  if (window.fins > 15)
    throw new Error("Timeout: Akui tests.");
  console.log('waiting...');
  setTimeout(Akui.finish, 250);
};

// ================================================================
// ================== Showtime! ===================================
// ================================================================


Akui.run_next();




















