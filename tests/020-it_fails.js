
Akui.test('it fails for unequal values', function (assert) {
  assert(true, false);
});


Akui.test('it fails for unequal arrays', function (assert) {
  assert([1], [1,2]);
});
