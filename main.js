Box = function(board, index, column, row, square) {
  // Used for reference to bitmasks.
  this.board = board;

  // 1..9, or zero for empty.
  this.value = 0;

  // 0..81
  this.index = index;

  // 0..8
  this.column = column;
  this.row = row;
  this.square = square;
};

Box.prototype.toString = function() {
  return "Box " + this.index + ": " + this.value + " (" + this.board.columns[this.column]
    + ", " + this.board.rows[this.row] + ", " + this.board.squares[this.square] + ")";
};

Box.prototype.setValue = function(newValue) {
  if (newValue < 0 || newValue > 9) {
    console.log("invalid proposed value: " + newValue);
    return false;
  }

  // Zero == clear it.
  if (newValue > 0 && !this.isValidValue(newValue))
    return false;

  this.board.removeMask(this.column, this.row, this.square, this.value);
  this.value = newValue;
  if (this.value > 0)
    this.board.addMask(this.column, this.row, this.square, this.value);
  return true;
};

Box.prototype.isValidValue = function(value) {
  if (value < 1 || value > 9) {
    console.log("invalid value: " + value);
    return false;
  }
  return !this.board.isMasked(this.column, this.row, this.square, value);
};

Board = function() {
  // There are 81 boxes, each in one of nine squares.
  this.boxes = [];
  this.squares = [];
  this.columns = [];
  this.rows = [];

  // Mark each container as having nothing in it.
  for (var i = 0; i < 9; ++i) {
    this.squares[i] = 0;
    this.columns[i] = 0;
    this.rows[i] = 0;
  }

  // Create each cell with its memberships.
  for (var i = 0; i < 81; ++i) {
    // Columns are 0..8 left to right.
    var column = i % 9;

    // Rows are 0..8 top to bottom.
    var row = Math.floor(i / 9);

    // Squares are 0..8 from upper-left to lower-right
    // in a western reading direction.
    var square = Math.floor(Math.floor(column / 3) + Math.floor(row / 3) * 3);

    this.boxes[i] = new Box(this, i, column, row, square);
  }
};

Board.prototype.getBox = function(column, row) {
  return this.boxes[column + row * 9];
};

Board.prototype.copy = function(sourceBoard) {
  for (var i = 0; i < 81; ++i)
    this.boxes[i].setValue(sourceBoard.boxes[i].value);
}

Board.prototype.addMask = function(column, row, square, value) {
  var mask = 1 << value;
  this.columns[column] |= mask;
  this.rows[row] |= mask;
  this.squares[square] |= mask;
};

Board.prototype.removeMask = function(column, row, square, value) {
  var mask = ~(1 << value);
  this.columns[column] &= mask;
  this.rows[row] &= mask;
  this.squares[square] &= mask;
};

Board.prototype.isMasked = function(column, row, square, value) {
  var mask = 1 << value;
  if (this.columns[column] & mask) return true;
  if (this.rows[row] & mask) return true;
  if (this.squares[square] & mask) return true;
  return false;
}

Solver = function() {
  this.boxesToSolve = [];
  this.picks = [];
  for (var i = 0; i < 81; ++i) {
    this.boxesToSolve[i] = i;
    this.picks[i] = 0;
  }
};

Solver.prototype.start = function(board) {
  this.board = new Board();
  this.board.copy(board);
  this.solve(0);
};

Solver.prototype.solve = function(virtualBoxIndex) {
  // If we've solved the last box, we're done!
  if (virtualBoxIndex == 81)
    return true;
  var boxIndex = this.boxesToSolve[virtualBoxIndex];
  var box = this.board.boxes[boxIndex];
  var candidates = this.getCandidates(boxIndex);
  var isBoxFixed = box > 0;
  while (candidates.length > 0) {
    var pick;
    if (isBoxFixed) {
      pick = box.value;
    } else {
      if (candidates.length == 1)
        pick = candidates[0];
      else
        pick = candidates[Math.floor(Math.random() * candidates.length)];
      this.picks[boxIndex] = pick;
      box.setValue(pick);
    }
    if (this.solve(virtualBoxIndex + 1))
      return true;

    // Backtrack.
    if (!isBoxFixed)
      box.setValue(0);
    var index = candidates.indexOf(pick);
    candidates.splice(index, 1);
  }

  // We ran out of candidates. Can't solve this box.
  return false;
};

Solver.prototype.getCandidates = function(boxIndex) {
  var box = this.board.boxes[boxIndex];
  var candidates = [];
  for (var i = 1; i <= 9; ++i) {
    if (box.isValidValue(i))
      candidates.push(i);
  }
  return candidates;
};

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
