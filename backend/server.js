const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

io.on("connection", (socket) => {
  console.log("Player connected");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

let rooms={}

/* GENERATE BOARD */

function generateBoard(){

let nums=[]
for(let i=1;i<=25;i++){
nums.push(i)
}

nums.sort(()=>Math.random()-0.5)

let board=[]
for(let i=0;i<5;i++){
board.push(nums.slice(i*5,i*5+5))
}

return board
}

/* CHECK BINGO */

function checkBingo(board,called){

let lines=0

for(let i=0;i<5;i++){

let row=true
for(let j=0;j<5;j++){
if(!called.includes(board[i][j])) row=false
}
if(row) lines++

}

for(let j=0;j<5;j++){

let col=true
for(let i=0;i<5;i++){
if(!called.includes(board[i][j])) col=false
}
if(col) lines++

}

let d1=true
for(let i=0;i<5;i++){
if(!called.includes(board[i][i])) d1=false
}
if(d1) lines++

let d2=true
for(let i=0;i<5;i++){
if(!called.includes(board[i][4-i])) d2=false
}
if(d2) lines++

return lines>=5
}

/* JOIN ROOM */

app.post("/api/join-room",(req,res)=>{

const {room_code,player_name}=req.body

if(!rooms[room_code]){
rooms[room_code]={
players:[],
called:[]
}
}

let room=rooms[room_code]

let board=generateBoard()

room.players.push({
name:player_name,
board:board
})

res.json({
player:room.players.length,
board:board
})

})

/* CALL NUMBER */

app.post("/api/call-number",(req,res)=>{

const {room_code,number}=req.body

let room=rooms[room_code]

if(!room) return res.json({})

if(!room.called.includes(number)){
room.called.push(number)
}

io.to(room_code).emit("number-called",number)

/* CHECK WINNER */

room.players.forEach(p=>{

if(checkBingo(p.board,room.called)){
io.to(room_code).emit("winner",p.name)
}

})

res.json({success:true})

})

/* ROOM LIST */

app.get("/api/rooms",(req,res)=>{

let list=[]

for(let code in rooms){

list.push({
room_code:code,
players:rooms[code].players.length
})

}

res.json(list)

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join-room",(room)=>{
socket.join(room)
})

})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})