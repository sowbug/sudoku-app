var boardHasProblem = false;
var pauseTime;
var selectedBox = -1;
var startTime;

function newPuzzle(boardDom) {
  var board = new Board();
  for (var j = 0; j < 9; ++j) {
    for (var i = 0; i < 9; ++i) {
      var box = board.getBoxByColumnAndRow(i, j);
      box.domElement = document.querySelector("#box-" + box.index);
      box.domElement.box = box;
    }
  }
  var solver = new Solver();
  solver.start(board);
  var generator = new Generator();
  generator.start(board);
  for (var i = 0; i < 81; ++i) {
    var box = board.getBox(i);
    if (box.value > 0) {
      box.fixed = true;
      box.domElement.innerHTML = box.value;
      box.domElement.classList.add('fixed');
    } else {
      box.domElement.innerHTML = '';
      box.domElement.classList.remove('fixed');
    }
  }
  startTime = new Date();
  pauseTime = null;
  gameComplete = false;
  return board;
}

function createBoardBox(majorRowIndex, squareIndex,
  minorRowIndex, boxIndex) {
  var td = document.createElement("td");
  var index = majorRowIndex * 27 + squareIndex * 3
  + minorRowIndex * 9 + boxIndex;
  td.id = "box-" + index;
  td.classList.add("box");
  return td;
}

function createBoardMinorRow(majorRowIndex, squareIndex, minorRowIndex) {
  var tr = document.createElement("tr");
  tr.classList.add("minor-row");
  for (var i = 0; i < 3; ++i) {
    tr.appendChild(createBoardBox(majorRowIndex,
      squareIndex, minorRowIndex, i));
  }
  return tr;
}

function createBoardSquare(rowIndex, squareIndex) {
  var td = document.createElement("td");
  td.classList.add("square");
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  td.appendChild(table);
  table.appendChild(tbody);
  for (var i = 0; i < 3; ++i) {
    tbody.appendChild(createBoardMinorRow(rowIndex, squareIndex, i));
  }
  return td;
}

function createBoardMajorRow(rowIndex) {
  var tr = document.createElement("tr");
  tr.classList.add("major-row");
  for (var i = 0; i < 3; ++i) {
    tr.appendChild(createBoardSquare(rowIndex, i));
  }
  return tr;
}

function createBoardTable() {
  var table = document.createElement("table");
  table.classList.add("board");
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);
  for (var i = 0; i < 3; ++i) {
    tbody.appendChild(createBoardMajorRow(i));
  }
  return table;
}

function createBoard() {
  var boardDom = document.querySelector("#board");
  boardDom.appendChild(createBoardTable());
  return boardDom;
}


onload = function() {
  var boardDom = createBoard();
  var board = newPuzzle(boardDom);

  var timerFunction = function() {
    if (board.gameComplete)
      return;
    if (pauseTime) {
      document.querySelector("#clock").innerHTML = "Resume";
    } else {
      var currentTime = new Date();
      var elapsed = Math.floor((currentTime - startTime) / 1000);
      var hours = Math.floor(elapsed / 3600);
      var minutes = Math.floor((elapsed - hours * 3600) / 60);
      var seconds = Math.floor(elapsed - hours * 3600 - minutes * 60);
      var elapsedString = '';
      if (seconds < 10)
        elapsedString = "0";
      elapsedString = ":" + elapsedString + seconds;
      if (minutes < 9)
        elapsedString = "0" + minutes + elapsedString;
      else
        elapsedString = minutes + elapsedString;
      if (hours > 0)
        elapsedString = hours + ":" + elapsedString;
      document.querySelector("#clock").innerHTML = elapsedString;
    }
  };
  setInterval(timerFunction, 100);

  var checkBoard = function() {
    if (selectedBox >= 0) {
      board.getBox(selectedBox).domElement.classList.remove('selected');
      selectedBox = -1;
    }
    var invalidBoxes = board.getInvalidBoxes();
    boardHasProblem = invalidBoxes.length > 0;
    for (var i = 0; i < 81; ++i)
      board.getBox(i).domElement.classList.remove('invalid');
    for (var i in invalidBoxes)
      board.getBox(invalidBoxes[i]).domElement.classList.add('invalid');
  };


  var selectBox = function(toSelect) {
    if (typeof toSelect === 'number') {
      toSelect = board.getBox(toSelect);
    }
    if (selectedBox >= 0)
      board.getBox(selectedBox).domElement.classList.remove('selected');
    selectedBox = toSelect.index;
    toSelect.domElement.classList.add('selected');
  };

  var isArrowKey = function(keyCode) {
    return (keyCode >= 37 && keyCode <= 40 );
  }

  var isClearBoxKey = function(keyCode) {
    return (keyCode == 8 || keyCode == 32 ||
        keyCode == 46 || keyCode == 48);  // backspace, space, delete and zero
  }

  var isValidNumberKey = function(keyCode) {
    return (keyCode >= 49 && keyCode <= 58 );
  }


  var processArrowKey = function(e) {
    if ( selectedBox < 0 ) {
      selectBox(0);
      return;
    }
    var neighbor;
    var isShiftCol = e.keyCode===37 || e.keyCode===39;   // left and right, shift col
    var isForward = e.keyCode>=39; // right and down is forward
    if (e.ctrlKey) {
      neighbor = board.getNavigableNeighborBox( selectedBox, isShiftCol, isForward);
    } else {
      neighbor = board.getNeighborBox( selectedBox, isShiftCol, isForward?1:-1);
    }
    if (neighbor) {
      selectBox(neighbor);
    }
  };

  var processClearBoxKey = function() {
    var box = board.getBox(selectedBox);
    var changed = board.clearBox(selectedBox);
    box.domElement.innerHTML = '';

    if (changed) {
      if (boardHasProblem) {
        checkBoard();
      }
    }
  }

  boardDom.addEventListener('click', function(e) {
    if (!e.target.box || e.target.box.isFixed()) {
      return;
    }
    selectBox(e.target.box.index);
  });

  // TODO(miket): refactor, consolidate with onkeypress handler.
  document.onkeydown = function(e) {
    if ( isArrowKey(e.keyCode) ) {
      processArrowKey(e);
    } else if ( isClearBoxKey(e.keyCode) && selectBox >= 0 ) {
      processClearBoxKey();
    }
  };

  document.onkeypress = function(e) {
    if (selectedBox < 0)
      return;
    var box = board.getBox(selectedBox);
    if (box.isFixed()) {
      return;
    }
    var changed = false;
    if (isValidNumberKey(e.keyCode)) {
      var value = e.keyCode - 48;
      changed = board.setBox(selectedBox, value);
      box.domElement.innerHTML = value;
    }
    if (changed) {
      if (boardHasProblem) {
        checkBoard();
      } else {
        if (board.gameComplete) {
          boardDom.classList.add("complete");
        }
      }
    }
  };

  document.querySelector("#new").onclick = function(e) {
    boardDom.classList.remove("complete");
    boardDom.classList.remove("blurred");
    board = newPuzzle(boardDom);
  };

  document.querySelector("#check").onclick = function(e) {
    checkBoard();
  };

  document.querySelector("#clock").onclick = function(e) {
    var classList = document.querySelector("#board").classList;
    if (classList.toggle("blurred")) {
      pauseTime = new Date();
    } else {
      var elapsed = new Date() - pauseTime;
      pauseTime = null;
      startTime.setTime(startTime.getTime() + elapsed);
    }
  };

};
