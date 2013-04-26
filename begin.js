

var test_report = function (type, _args_) {
  test_report.all.push(arguments);
  test_report[(type === 'pass' || type === 'fail') ? type : 'err'].push(arguments);
  if (_args_.message && _args_.constructor && _args_.constructor === Error)
    throw _args_;
  return test_report;
};

test_report.pass = [];
test_report.fail = [];
test_report.err  = [];
test_report.all  = [];

var test_name   = null;

function test_error(msg) {
  test_report('err', msg);
};

window.onerror = test_error;

function test(name, func) {

  var hash = (window.location.hash !== '') ? window.location.hash.replace('#', '') : null;

  if (hash && name.indexOf(hash) < 0)
    return;

  test_name = name;
  try {
    func();
  } catch (e) {
    test_report('err', e);
  }
}

function print_report_all() {
  if (test_report.fail.length || test_report.err.length)
    console.log('Pass: ' + test_report.pass.length, ", Fails: " + test_report.fail.length, ", Errs: " + test_report.err.length);
  else if (test_report.pass.length > 0)
    console.log("ALL PASS.");

  _.each(test_report.all, function (args) {
    print_report.apply(null, args);
  });
}

function print_report(type, name, exp, act) {

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
}


function assert (exp, act, name) {
  if (exp === act)
    test_report('pass', (name || test_name), exp, act);
  else
    test_report('fail', (name || test_name), exp, act);
}

assert.deepEqual = function (a, b, name) {
  name = name || test_name;
  var j_a = JSON.stringify(a);
  var j_b = JSON.stringify(b);
  try {
    proclaim.deepEqual(a, b);
    test_report('pass', name, j_a, j_b);
  } catch (e) {
    test_report('fail', name, j_a, j_b);
  }
};

