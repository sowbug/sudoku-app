Solver = function() {
};

Solver.prototype.start = function(board) {
  this.board = board;
  return this.solve(0);
};

Solver.prototype.solve = function(boxIndex) {
  // If we've solved the last box, we're done!
  if (boxIndex == 81)
    return true;
  var box = this.board.boxes[boxIndex];
  var candidates = this.board.getCandidates(boxIndex);
  var isBoxFixed = box > 0;
  while (candidates.length > 0 || isBoxFixed) {
    var pick;
    if (isBoxFixed) {
      pick = box.value;
    } else {
      pick = candidates[Math.floor(Math.random() * candidates.length)];
      box.setValue(pick);
    }
    if (this.solve(boxIndex + 1))
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
