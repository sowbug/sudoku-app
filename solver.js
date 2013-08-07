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
  var candidates = this.board.getCandidates(boxIndex);
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
