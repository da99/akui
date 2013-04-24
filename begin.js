
window.onerror = function (msg, file, line) {
  if (window.error)
    error(msg, file + ':' + line);
  else
    console.log("JS Error: " + msg);
}
