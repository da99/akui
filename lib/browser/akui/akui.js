"use strict";
/* jshint undef: true, unused: true */
/* global _, fermata */
/* exported _, fermata */

var log = function () {
  console['log'].apply(console, arguments);
}; // === func

fermata.json('/akui/run')({path: window.location.pathname}).post(function (err, data, headers) {
  if (err) {
    log(err);
  } else {
    log(data);
    log(headers);
  }
});
