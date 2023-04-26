export function getMyPlayerObject(game)
{
  const myPlayerObject = game.playerForClientSide
  if(game.players[0].socketId === myPlayerObject.socketId)
  {
    return game.players[0]
  }
  else return game.players[1]
}

export function getOpponentPlayer(game)
{
  const myPlayerObject = game.playerForClientSide
  if(game.players[0].socketId === myPlayerObject.socketId)
  {
    return game.players[1]
  }
  else return game.players[0]
}

export function isSinglePlayer(){
  let params = (new URL(document.location)).searchParams;
  let singlePlayer = params.get('singlePlayer');
  return singlePlayer;
}

export function getPlayerName(){
  let params = (new URL(document.location)).searchParams;
  let name = params.get('name');
  return name;
}

export function hideGreeting()
{
  const greetingElement = document.getElementById("greeting");
  const loadingElement = document.getElementById("loading");
  if(greetingElement)
  {
    greetingElement.innerHTML = null;
  }
  if(loadingElement) {
    loadingElement.innerHTML = null;
  }
}
