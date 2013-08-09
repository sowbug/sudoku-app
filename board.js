Board = function() {
  // There are 81 boxes, each in one of nine squares.
  this.boxes = [];
  this.squares = [];
  this.columns = [];
  this.rows = [];

  // Mark each container as having nothing in it.
  this.clearMasks();

  this.gameComplete = false;

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

Board.prototype.setBox = function(index, value) {
  var changed = false;
  var box = this.boxes[index];
  var wasSet = box.isSet();
  this.boxes[index].setValue(value);
  if (!wasSet && box.isSet()) {
    changed = true;
    if (this.getFilledBoxCount() == 81 && this.check())
      this.gameComplete = true;
  } else if (wasSet && !box.isSet()) {
    changed = true;
  }
  return changed;
};

Board.prototype.clearBox = function(index) {
  return this.setBox(index, 0);
};

Board.prototype.clearMasks = function() {
  for (var i = 0; i < 9; ++i) {
    this.squares[i] = 0;
    this.columns[i] = 0;
    this.rows[i] = 0;
  }
};

Board.prototype.getBoxByColumnAndRow = function(column, row) {
  return this.boxes[column + row * 9];
};

Board.prototype.getNavigableNeighborBox = function(index, isShiftCol, isForward) {
  for (var i = 1; i<9; i++) {
    var box = this.getNeighborBox(index, isShiftCol, isForward?i:-i);
    if (!box.isFixed())
      return box;
  }
  return null;
}

Board.prototype.getNeighborBox = function(index, isShiftCol, ammt) {
  var column = index % 9;
  var row = Math.floor(index / 9);

  if (isShiftCol) {
    column = ( column + ammt + 9 ) % 9;
  } else {
    row = ( row + ammt + 9 ) % 9;
  }
  index = row * 9 + column;
  return this.boxes[index];
}

Board.prototype.getBox = function(index) {
  return this.boxes[index];
};

Board.prototype.copy = function(sourceBoard) {
  for (var i = 0; i < 81; ++i)
    this.boxes[i].setValue(new Number(sourceBoard.boxes[i].value));
}

Board.prototype.addMask = function(column, row, square, value) {
  if (value == 0)
    return;
  var mask = 1 << value;
  this.columns[column] |= mask;
  this.rows[row] |= mask;
  this.squares[square] |= mask;
};

Board.prototype.regenerateMasks = function() {
  this.clearMasks();
  for (var i = 0; i < 81; ++i) {
    var box = this.boxes[i];
    this.addMask(box.column, box.row, box.square, box.value)
  }
};

Board.prototype.isMasked = function(column, row, square, value) {
  var mask = 1 << value;
  if (this.columns[column] & mask) return true;
  if (this.rows[row] & mask) return true;
  if (this.squares[square] & mask) return true;
  return false;
}

Board.prototype.getCandidates = function(boxIndex) {
  var box = this.boxes[boxIndex];
  var candidates = [];
  for (var i = 1; i <= 9; ++i) {
    if (box.isValidValue(i) || i == box.value)
      candidates.push(i);
  }
  return candidates;
};

Board.prototype.getFilledBoxCount = function() {
  var result = 0;
  for (var i = 0; i < 81; ++i)
    if (this.boxes[i].value > 0)
      ++result;
  return result;
}

Board.prototype.getInvalidBoxes = function() {
  var invalidBoxes = [];
  for (var i = 0; i < 81; ++i) {
    var box = this.getBox(i);
    var value = box.value;
    if (value == 0) {
      continue;
    }
    box.setValue(0);
    var isValid = box.isValidValue(value);
    box.setValue(value);
    if (!isValid)
      invalidBoxes.push(i);
  }
  return invalidBoxes;
}

Board.prototype.check = function() {
  return this.getInvalidBoxes().length == 0;
}
