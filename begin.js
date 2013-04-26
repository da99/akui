
window.onerror = function (msg, file, line) {
  if (window.error) {
    error(msg, file + ':' + line);
  }
  throw msg;
};

var results = {pass: 0, fail: 0, error: 0};
var test_name = null;

function test (name, func) {
  var hash = (window.location.hash !== '') ? window.location.hash.replace('#', '') : null;

  if (hash && name.indexOf(hash) < 0)
    return;

  test_name = name;
  try {
    func();
  } catch (e) {
    error(name, e);
  }
}

function span(txt) {
  return '<span>' + (txt + '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
}
function passed(name, exp, act) {
  results.pass = results.pass + 1;
  $('#results').append('<div class="passed">' + span(exp) + ' === ' + span(act) + '<br /> ' + name + '</div>');
}

function failed(name, exp, act) {
  results.fail = results.fail + 1;
  $('#results').append('<div class="failed">' + span(exp) + ' === ' + span(act) + '<br /> ' + name + '</div>');
}

function error(name, act) {
  results.error = results.error + 1;
  $('#results').append('<div class="failed">' + span(act) + '<br /> ' + name + '</div>');
}

function assert (exp, act, name) {
  if (exp === act)
    passed(name || test_name, exp, act);
  else
    failed(name || test_name, exp, act)

}

assert.deepEqual = function (a, b, name) {
  name = name || test_name;
  var j_a = JSON.stringify(a);
  var j_b = JSON.stringify(b);
  try {
    proclaim.deepEqual(a, b);
    passed(name, j_a, j_b);
  } catch (e) {
    failed(name, j_a, j_b);
  }
};

