var selectedBox;
var boxWidth = 50;
var boxHeight = 50;

function newPuzzle(boardDom) {
  var board = new Board();
  for (var j = 0; j < 9; ++j) {
    for (var i = 0; i < 9; ++i) {
      var box = board.getBox(i, j);
      box.domElement = document.querySelector("#box-" + i + j * 9);
      box.domElement.box = box;
      box.text = box.domElement.getElementsByTagName('span')[0];
    }
  }
  var solver = new Solver();
  solver.start(board);
  var generator = new Generator();
  generator.start(board);
  for (var i = 0; i < 81; ++i) {
    var box = board.boxes[i];
    if (box.value > 0) {
      box.text.innerHTML = box.value;
      box.domElement.classList.add('fixed');
    } else {
      box.text.innerHTML = '';
      box.domElement.onclick = function(e) {
        if (selectedBox)
          selectedBox = selectedBox.unselect();
        selectedBox = this.box.select();
      }.bind(box.domElement);
    }
  }
  return board;
}

function createBoard() {
  var boardDom = document.querySelector("#board");

  for (var j = 0; j < 9; ++j) {
    for (var i = 0; i < 9; ++i) {
      var boxDom = document.createElement('div');
      boxDom.id = 'box-' + i + j * 9;
      boxDom.className = 'box';
      boxDom.style.position = 'absolute';
      boxDom.style.left = i * boxWidth + 'px';
      boxDom.style.top = j * boxHeight + 'px';
      if ((i + 1) % 3 == 0 && i < 8)
        boxDom.classList.add('square-right');
      if ((j + 1) % 3 == 0 && j < 8)
        boxDom.classList.add('square-bottom');
      boardDom.appendChild(boxDom);
      var text = document.createElement('span');
      text.className = 'text';
      boxDom.appendChild(text);
    }
  }
  return boardDom;
}

onload = function() {
  var boardDom = createBoard();
  var board = newPuzzle(boardDom);

  document.onkeypress = function(e) {
    if (!selectedBox)
      return;

    if (e.keyCode >= 49 && e.keyCode <= 58) {
      var value = e.keyCode - 48;
      selectedBox.setValue(value);
      selectedBox.text.innerHTML = value;
    }

    // Why can't I get the delete key?
    if (e.keyCode == 32 || e.keyCode == 48) {
      selectedBox.setValue(0);
      selectedBox.text.innerHTML = '';
    }
  };
  document.querySelector("#new").onclick = function(e) {
    board = newPuzzle(boardDom);
  };
  document.querySelector("#check").onclick = function(e) {
    var solver = new Solver();
    console.log(solver.start(board));
  };
};
