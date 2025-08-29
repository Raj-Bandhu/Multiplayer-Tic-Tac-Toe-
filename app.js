const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

const io = new Server(server)

app.use(express.static("public"))
app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/public/index.html')
})

 const players ={}

let playerTurn = null
let game = [
    [null,null,null],
    [null,null,null],
    [null,null,null],
]



io.on("connection", (socket) => {
  console.log("A user connected", socket.id)
    
    socket.on("disconnect", () => {
    console.log("User disconnected", socket.id)
    if (players.P1?.id === socket.id) delete players.P1
    if (players.P2?.id === socket.id) delete players.P2
})



    if(Object.keys(players).length === 0){
    players.P1 = {
        id : socket.id,
        symbol: "X"
    }
    console.log("Player1 connected")
    console.log(players)

  }
  else{
    players.P2 = {
        id : socket.id,
        symbol: "O"
    }
 
    console.log("Player 2 Connected")
    console.log(players)
  }

  playerTurn = players.P1.id
  symbol = players.P1.symbol
  socket.on("cellClick", (cellId) => {
    if(playerTurn ===  socket.id){
    console.log("Cell clicked:", cellId)
    const rowcol = cellId.split('')
    console.log(rowcol)
    game[Number(rowcol[1])-1][Number(rowcol[3])-1] = symbol
    io.emit("cellUpdate", cellId,symbol)
    playerTurn = playerTurn === players.P1.id ? players.P2.id : players.P1.id
    symbol = symbol === players.P1.symbol ? players.P2.symbol : players.P1.symbol

    console.log(game)
    console.log(checkWinner(game))
    if(checkWinner(game)){
        if(checkWinner(game)==='X'){
            io.emit('win', players.P1.id)
        }
        else if (checkWinner(game)==='O'){
            io.emit('win', players.P2.id)
        }
        else io.emit('draw', "It's a Draw")
    }



}  else{ console.log("Not Your turn", socket.id)

}


  });

});
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})



    function checkWinner(game) {
  // check rows
  for (let row = 0; row < 3; row++) {
    if (game[row][0] && game[row][0] === game[row][1] && game[row][1] === game[row][2]) {
      return game[row][0]  // "X" or "O"
    }
  }

  // check columns
  for (let col = 0; col < 3; col++) {
    if (game[0][col] && game[0][col] === game[1][col] && game[1][col] === game[2][col]) {
      return game[0][col]
    }
  }

  // check diagonals
  if (game[0][0] && game[0][0] === game[1][1] && game[1][1] === game[2][2]) {
    return game[0][0]
  }
  if (game[0][2] && game[0][2] === game[1][1] && game[1][1] === game[2][0]) {
    return game[0][2]
  }

  // check for draw
  let isDraw = game.flat().every(cell => cell !== null)
  if (isDraw) return "draw"

  return null // no winner yet
}