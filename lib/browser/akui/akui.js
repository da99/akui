"use strict";
/* jshint undef: true, unused: true */
/* global _, fermata */
/* exported _, fermata */

var log = function () {
  console['log'].apply(console, arguments);
}; // === func

var site = fermata.json('/akui/run');
site.post(function (err, data, headers) {
  log(err);
  log(data);
  log(headers);
});
