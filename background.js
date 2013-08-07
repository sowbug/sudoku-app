chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    'id': 'sudoku',
    'frame': 'chrome',
    'width': 480,
    'height': 640
  });
});
