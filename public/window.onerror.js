window.akui_window_errs = [];

if (!window.onerror) {
  window.onerror = function (msg) {
    window.akui_window_errs.push(msg);
  };
}
