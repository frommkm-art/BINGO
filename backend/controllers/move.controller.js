const pool = require("../config/db");
const countLines = require("../utils/bingoEngine");

exports.callNumber = async (req, res) => {
  try {
    const { room_code, number } = req.body;

    // check if number already called
    const checkQuery =
      "SELECT * FROM moves WHERE room_code = $1 AND number_called = $2";

    const checkResult = await pool.query(checkQuery, [room_code, number]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: "Number already called"
      });
    }

    // insert number
    const insertQuery =
      "INSERT INTO moves (room_code, number_called) VALUES ($1,$2) RETURNING *";

    const result = await pool.query(insertQuery, [room_code, number]);
// get all called numbers
const moves = await pool.query(
  "SELECT number_called FROM moves WHERE room_code = $1",
  [room_code]
);

const calledNumbers = moves.rows.map(r => r.number_called);

// get player boards
const boards = await pool.query(
  "SELECT player_name, board FROM boards WHERE room_code = $1",
  [room_code]
);

let winner = null;

for (const row of boards.rows) {
  const board = JSON.parse(row.board);

  const lines = countLines(board, calledNumbers);

  if (lines >= 5) {
    winner = row.player_name;
    break;
  }
}

res.json({
  success: true,
  move: result.rows[0],
  winner: winner
});

    res.json({
      success: true,
      move: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMoves = async (req, res) => {
  try {
    const { room_code } = req.params;

    const query =
      "SELECT number_called FROM moves WHERE room_code = $1 ORDER BY id";

    const result = await pool.query(query, [room_code]);

    const numbers = result.rows.map(row => row.number_called);

    res.json({
      success: true,
      numbers: numbers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};