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

  // if (newValue > 0 && !this.isValidValue(newValue))
  //   return false;

  this.board.removeMask(this.column, this.row, this.square, this.value);
  this.value = newValue;

  // Zero == clear it.
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

Box.prototype.unselect = function() {
  this.domElement.classList.remove('selected');
  return null;
};

Box.prototype.select = function() {
  this.domElement.classList.add('selected');
  return this;
};
