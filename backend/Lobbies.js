class Lobbies {
  constructor (io) {
    this.lobbies = []
    this.io = io;
  }

  getLobbies() {
    return this.lobbies;
  }

  addLobby(game) {
    const lobbyAlreadyExists = this.lobbies.some(lobby => lobby._id.equals(game._id))
    if(!lobbyAlreadyExists){
      this.lobbies.push(game);
    }
  }
  removeLobby(game) {
    if(game) {
      this.lobbies = this.lobbies.filter(lobby => !lobby._id.equals(game._id))
    }
    
  }

  purgeEmptyLobbies() {
    this.lobbies = this.lobbies.filter(lobby => {
      const player1 = lobby.players[0]
      const player2 = lobby.players[1]

      const isPlayer1Connected = player1 && (this.io.sockets.connected[player1.socketId] != undefined)
      const isPlayer2Connected = player2 && (this.io.sockets.connected[player2.socketId] != undefined)
      const shouldKeepThisLobby = isPlayer1Connected || isPlayer2Connected;

      return shouldKeepThisLobby;
    })
  }

}

export default Lobbies;