
window.onerror = function (msg, file, line) {
  if (window.error) {
    error(msg, file + ':' + line);
  }
  throw msg;
}
