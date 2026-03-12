const express = require("express");
const router = express.Router();

const { callNumber, getMoves } = require("../controllers/move.controller");

router.post("/call-number", callNumber);
router.get("/moves/:room_code", getMoves);

module.exports = router;