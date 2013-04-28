
Akui.test('it runs', function (assert) {
  assert(true, true);
});

Akui.on('finish', function () {
  Akui.print.all();
  Akui.reset();
  Akui.run();
});
