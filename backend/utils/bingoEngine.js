function countLines(board, calledNumbers) {

  // mark board
  const marked = board.map(row =>
    row.map(num => calledNumbers.includes(num))
  );

  let lines = 0;

  // check rows
  for (let i = 0; i < 5; i++) {
    if (marked[i].every(cell => cell === true)) {
      lines++;
    }
  }

  // check columns
  for (let j = 0; j < 5; j++) {
    let columnComplete = true;

    for (let i = 0; i < 5; i++) {
      if (!marked[i][j]) {
        columnComplete = false;
        break;
      }
    }

    if (columnComplete) lines++;
  }

  // check diagonal \
  let diag1 = true;
  for (let i = 0; i < 5; i++) {
    if (!marked[i][i]) {
      diag1 = false;
      break;
    }
  }
  if (diag1) lines++;

  // check diagonal /
  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!marked[i][4 - i]) {
      diag2 = false;
      break;
    }
  }
  if (diag2) lines++;

  return lines;
}

module.exports = countLines;