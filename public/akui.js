
// ================================================================
// ================== Vars ========================================
// ================================================================


var Akui = {};

Akui.report = {
  pass  : [],
  fail  : [],
  error : [],
  all   : []
};

Akui.current = {
  test_name : null
};

// ================================================================
// ================== Reporting Results ===========================
// ================================================================


Akui.pass(msg)  { Akui.result('pass', msg); };
Akui.fail(msg)  { Akui.result('fail', msg); };
Akui.error(msg) { Akui.result('error', msg); };

Akui.result = function (type, _args_) {
  Akui.report.all.push(arguments);
  Akui.report[(type === 'pass' || type === 'fail') ? type : 'error'].push(arguments);
  if (_args_.message && _args_.constructor && _args_.constructor === Error)
    throw _args_;
  return Akui;
};

window.onerror = Akui.error;


// ================================================================
// ================== Testing =====================================
// ================================================================


function assert (exp, act, name) {
  var a = JSON.stringify(exp);
  var b = JSON.stringify(act);
  if (_.isEqual(exp, act))
    Akui.pass((name || Akui.current.test_name), a, b);
  else
    Akui.fail((name || Akui.current.test_name), a, b);
}

Akui.test = function (name, func) {

  var hash = (window.location.hash !== '') ? window.location.hash.replace('#', '') : null;

  if (hash && name.indexOf(hash) < 0)
    return;

  Akui.current.test_name = name;

  try {
    func();
  } catch (e) {
    Akui.error(e);
  }

};

// ================================================================
// ================== Printing ====================================
// ================================================================


Akui.print = {};

Akui.print.all = function() {
  if (Akui.report.fail.length || Akui.report.error.length)
    console.log('Pass: ' + Akui.report.pass.length, ", Fails: " + Akui.report.fail.length, ", Errs: " + Akui.report.error.length);
  else if (Akui.report.pass.length > 0)
    console.log("ALL PASS.");

  _.each(Akui.report.all, function (args) {
    print_report.apply(null, args);
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
}

