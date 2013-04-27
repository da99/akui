
// ================================================================
// ================== Vars ========================================
// ================================================================


var Akui = {};

Akui.report = {
  pass  : [],
  fail  : [],
  error : [],
  waits : [],
  all   : []
};

Akui.current = {
  test_name : null,
  test_index : -1
};

// ================================================================
// ================== Reporting Results ===========================
// ================================================================


Akui.pass(name, msg)  { Akui.result('pass',  name, msg); };
Akui.fail(name, msg)  { Akui.result('fail',  name, msg); };
Akui.error(name, msg) { Akui.result('error', name, msg); };

Akui.result = function (type, name, exp, act) {
  var args = Array.prototype.slice.apply(arguments, []);

  if (Akui.report.waits[name]) {
    var test = Akui.report.waits[name];
    name         = args[1] = test.name;
    test.fin     = true;
    test.results = args;
  }

  Akui.report.all.push(args);
  Akui.report[(type === 'pass' || type === 'fail') ? type : 'error'].push(args);

  var is_err = exp.message && exp.constructor && exp.constructor === Error;
  if (is_err)
    throw exp;

  return Akui;
};

window.onerror = Akui.error;


// ================================================================
// ================== Printing ====================================
// ================================================================


Akui.print = {};

Akui.print.all = function() {
  if (Akui.report.fail.length || Akui.report.error.length)
    console.log('Pass: ' + Akui.report.pass.length, ", Fails: " + Akui.report.fail.length, ", Errs: " + Akui.report.error.length);
  else if (Akui.report.pass.length > 0)
    console.log("ALL PASS.");

  _.each(Akui.report.all, function (test) {
    Akui.print.report.apply(null, test.result);
  });
}

// ================================================================
// ===     You can write over this function in your tests.      ===
// ================================================================
Akui.print.report = function(type, name, exp, act) {

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
    Akui.error(index, e);
  }

};

Akui.run_next = function () {
  microAjax('/akui_tests/next', function (str) {
    alert(typeof str);
  });
};

// ================================================================
// ================== Showtime! ===================================
// ================================================================

Akui.run_next();




















