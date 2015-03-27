"use strict";
/* jshint undef: true, unused: true */
/* global _, fermata */
/* exported _, fermata */

// === SCOPE
(function () {
  var results = [];

  var should = {
    equal: function (one, two) {
      if (_.isEqual(one,two)) {
        results.push(true);
      } else {
        throw new Error('Failed: !_.isEqual: ' + one +  ' !== ' + two);
      }
    }
  }; // var should

  var log = function () {
    console['log'].apply(console, arguments);
  }; // === func

  fermata.json('/akui/run').post(function (err, data, headers) {
    log(headers);
    log(data);
    if (err) {
      log(err);
      return false;
    }

    if (!data.test && data.redirect) {
      window.location.href = data.redirect;
      return false;
    }

    if (data.error)
      throw new Error(data.error);

    log(data.test.script);
    var test_result = (new Function('should', data.test.script))(should);

    if (_.isEmpty(results))
      throw new Error("Empty specifications: \n" + data.test.script);

    if (_.isFunction(test_result))
      test_result();
    else {
      log(results);
      log('Done running tests.');
    }
  });
})();
