const express = require("express");
const router = express.Router();

const { createRoom, joinRoom } = require("../controllers/room.controller");

router.post("/create-room", createRoom);
router.post("/join-room", joinRoom);

module.exports = router;