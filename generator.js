function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

Generator = function() {
};

Generator.prototype.start = function(board) {
  var generatedBoard = new Board();
  this.boxIndexes = [];
  for (var i = 0; i < 81; ++i)
    this.boxIndexes.push(i);
  shuffle(this.boxIndexes);

  for (var i = 0; i < 81; ++i) {
    var boxIndex = this.boxIndexes[i];
    var candidates = generatedBoard.getCandidates(boxIndex);
    if (candidates.length == 0)
      break;
    if (candidates.length > 1)
      generatedBoard.boxes[boxIndex].setValue(board.boxes[boxIndex].value);
  }
  board.copy(generatedBoard);
};
