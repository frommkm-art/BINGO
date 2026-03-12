const pool = require("../config/db");
const generateRoomCode = require("../utils/generateRoomCode");
const generateBoard = require("../utils/generateBoard");

exports.createRoom = async (req, res) => {
  try {
    const roomCode = generateRoomCode();

    const query = `
      INSERT INTO rooms (room_code)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [roomCode]);

    res.json({
      success: true,
      room: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating room",
    });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { room_code, player_name } = req.body;

   const existingPlayer = await pool.query(
     "SELECT * FROM boards WHERE room_code = $1 AND player_name = $2",
     [room_code, player_name]
   );

   if (existingPlayer.rows.length > 0) {
     return res.json({
       message: "Player already joined this room"
     });
   }

    const roomQuery = "SELECT * FROM rooms WHERE room_code = $1";
    const roomResult = await pool.query(roomQuery, [room_code]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room = roomResult.rows[0];

if (!room.player1) {

  await pool.query(
    "UPDATE rooms SET player1 = $1 WHERE room_code = $2",
    [player_name, room_code]
  );

} else if (!room.player2) {

  await pool.query(
    "UPDATE rooms SET player2 = $1, status = 'playing' WHERE room_code = $2",
    [player_name, room_code]
  );

  // notify players that game started
const io = req.app.get("io");
if (io) {
  io.to(room_code).emit("game-start");
}

} else {

  return res.status(400).json({ message: "Room is full" });

}
    const board = generateBoard();

    await pool.query(
      "INSERT INTO boards (room_code, player_name, board) VALUES ($1,$2,$3)",
      [room_code, player_name, JSON.stringify(board)]
    );

    res.json({
      success: true,
      message: "Joined room successfully",
      board: board
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};