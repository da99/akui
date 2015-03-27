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

  fermata.json('/akui/run')({path: window.location.pathname}).post(function (err, data, headers) {
    if (err) {
      log(err);
    } else {
      log(headers);
      (new Function('should', data.test.script))(should);
      log(results);
    }
  });
})();
