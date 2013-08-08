var boardHasProblem = false;
var pauseTime;
var selectedBox = -1;
var startTime;

function selectBox(index) {

}

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
      box.domElement.innerHTML = box.value;
      box.domElement.classList.add('fixed');
    } else {
      box.domElement.innerHTML = '';
      box.domElement.classList.remove('fixed');
      box.domElement.onclick = function(e) {
        if (selectedBox >= 0)
          board.getBox(selectedBox).domElement.classList.remove('selected');
        selectedBox = this.box.index;
        board.getBox(selectedBox).domElement.classList.add('selected');
      }.bind(box.domElement);
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

  document.onkeypress = function(e) {
    if (selectedBox < 0)
      return;
    var box = board.getBox(selectedBox);
    var changed = false;
    if (e.keyCode >= 49 && e.keyCode <= 58) {
      var value = e.keyCode - 48;
      changed = board.setBox(selectedBox, value);
      box.domElement.innerHTML = value;
    }

    // Why can't I get the delete key?
    if (e.keyCode == 32 || e.keyCode == 48) {
      changed |= board.clearBox(selectedBox);
      box.domElement.innerHTML = '';
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
