const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())

app.use(express.static(path.join(__dirname,"frontend")))

const PORT = process.env.PORT || 7000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

let rooms = {};

/* GENERATE BINGO BOARD */

function generateBoard(){

let numbers=[];

while(numbers.length<25){

let n=Math.floor(Math.random()*75)+1;

if(!numbers.includes(n)){
numbers.push(n);
}

}

let board=[];

for(let i=0;i<5;i++){
board.push(numbers.slice(i*5,i*5+5));
}

return board;

}

/* JOIN ROOM API */

app.post("/api/join-room",(req,res)=>{

const {room_code,player_name}=req.body;

if(!rooms[room_code]){

rooms[room_code]={
players:[],
called:[],
turn:1
}

let room=rooms[room_code];

if(room.players.length>=2){

return res.json({
message:"Room full"
});

}

let playerNumber=room.players.length+1;

let board=generateBoard();

room.players.push({
name:player_name,
board:board
});

res.json({
player:playerNumber,
board:board
});

});

/* CALL NUMBER API */


app.post("/api/call-number",(req,res)=>{

const {room_code,number,player}=req.body

let room=rooms[room_code]

if(!room) return res.json({})

/* CHECK TURN */

if(room.turn !== player){
return res.json({
message:"Not your turn"
})
}

/* SAVE NUMBER */

if(!room.called.includes(number)){
room.called.push(number)
}

/* SEND NUMBER */

io.to(room_code).emit("number-called",number)

/* CHECK WINNER */

room.players.forEach(p=>{

if(checkBingo(p.board,room.called)){
io.to(room_code).emit("winner",p.name)
}

})

/* SWITCH TURN */

if(room.turn === room.players.length){
room.turn = 1
}else{
room.turn++
}

io.to(room_code).emit("turn",room.turn)

res.json({success:true})

})

/* SOCKET CONNECTION */

io.on("connection",(socket)=>{

console.log("Player connected");

socket.on("join-room",(roomCode)=>{

socket.join(roomCode);

});

socket.on("call-number",(data)=>{

io.to(data.room_code).emit("number-called",data.number);

});

});

/* START SERVER */

server.listen(7000,()=>{
console.log("Bingo server running on http://localhost:7000");
});