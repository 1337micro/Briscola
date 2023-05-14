import {Table} from "antd";
import axios from "axios";
import {useEffect, useState} from "react";

function Lobbies() {

  const [lobbies, setLobbies] = useState([]);
  useEffect(() => {
    axios({
      method: 'get',
      url: '/lobbies',
      responseType: 'json'
    })
      .then(response => response.data)
      .then(setLobbies)
  }, [])

  const dataSource = lobbies.map(lobby => {
    console.log(lobby)
    const playerName = lobby.players[0].name || 'Anonymous';
    return {key: lobby._id, playerName: playerName, lobbyDescription: `Click to join ${playerName}'s lobby`}
  })

  const columns = [
    {
      title: 'Player Name',
      dataIndex: 'playerName',
      key: 'key',
    },
    {
      title: 'Lobby',
      dataIndex: 'playerName',
      key: 'key',
      render: (playerName, lobby) => {
        return <a
          href={`http://${window.location.hostname}:80/game.html?gameId=${lobby.key}`}
          target='_top'
        >
          Click to join {playerName}'s lobby
        </a>
      }
    }
  ];


  return <Table
    dataSource={dataSource}
    columns={columns}
    locale={{emptyText: 'No Lobbies. Please Press "Create Game".'}}/>
}

export default Lobbies;