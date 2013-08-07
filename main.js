onload = function() {
  var board = new Board();
  var boardDom = document.querySelector("#board");
  var boxWidth = 50;
  var boxHeight = 50;

  for (var j = 0; j < 9; ++j) {
    for (var i = 0; i < 9; ++i) {
      var boxDom = document.createElement('div');
      var box = board.getBox(i, j);

      box.domElement = boxDom;

      boxDom.box = box;
      boxDom.id = 'box-' + box.index;
      boxDom.className = 'box';
      boxDom.style.position = 'absolute';
      boxDom.style.left = i * boxWidth + 'px';
      boxDom.style.top = j * boxHeight + 'px';
      boardDom.appendChild(boxDom);

      boxDom.onclick = function(e) {
        if (selectedBox)
          selectedBox = selectedBox.unselect();
        selectedBox = this.box.select();
      }.bind(boxDom);
    }
  }
  var solver = new Solver();
  solver.start(board);
  for (var i = 0; i < 81; ++i) {
    if (solver.picks[i]) {
      board.boxes[i].setValue(solver.picks[i]);
      board.boxes[i].domElement.innerHTML = board.boxes[i].value;
    }
  }

  document.onkeypress = function(e) {
    if (!selectedBox)
      return;
    if (e.keyCode >= 49 && e.keyCode <= 58)
      selectedBox.setValue(e.keyCode - 48);
  };
};
