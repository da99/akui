
Akui.test('it passes for equal values', function (assert) {
  assert(true, true);
});

Akui.test('it passes for equal arrays', function (assert) {
  assert([1,2,3], [1,2,3]);
});

Akui.on('finish', function () {
  Akui.print.all();
  Akui.reset();
  Akui.run();
});
