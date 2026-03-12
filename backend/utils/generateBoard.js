function generateBoard() {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);

  // shuffle numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // convert to 5x5 matrix
  const board = [];
  for (let i = 0; i < 5; i++) {
    board.push(numbers.slice(i * 5, i * 5 + 5));
  }

  return board;
}

module.exports = generateBoard;