Board = function() {
  // There are 81 boxes, each in one of nine squares.
  this.boxes = [];
  this.squares = [];
  this.columns = [];
  this.rows = [];

  // Mark each container as having nothing in it.
  this.clearMasks();

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

Board.prototype.clearMasks = function() {
  for (var i = 0; i < 9; ++i) {
    this.squares[i] = 0;
    this.columns[i] = 0;
    this.rows[i] = 0;
  }
};

Board.prototype.getBox = function(column, row) {
  return this.boxes[column + row * 9];
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
