var WIDTH = 400;
var HEIGHT = 440;

var onCreate = function(window) {
    // There seems to be a bug where resizeTo includes the title bar
    // height and isn't the same as the width/height parameters passed
    // to app.window.create().
    //    window.resizeTo(WIDTH, HEIGHT + UNKNOWN_TITLE_BAR_HEIGHT);
};

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    'id': 'sudoku-0.0.3.0-id',
    'frame': 'chrome',
    'width': WIDTH,
    'height': HEIGHT,
    'resizable': true
  }, onCreate);
});
