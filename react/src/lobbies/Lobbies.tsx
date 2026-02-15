import {Table} from "antd";
import axios from "axios";
import {useEffect, useState} from "react";

import './Lobbies.css'

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

  const dataSource = lobbies.map( (lobby:any) => {
    console.log(lobby)
    const playerName = lobby.players[0].name || 'Anonymous';
    return {key: lobby._id, playerName: playerName, gameType: lobby.gameType ?? '300'};
  })

  const columns = [
    {
      title: 'Player Name',
      dataIndex: 'playerName',
      key: 'playerName',
    },
    {
      title: 'Lobby',
      dataIndex: 'playerName',
      key: 'key',
      render: (playerName:any, lobby:any) => {
        return <a
          href={`http://${window.location.hostname}:80/game.html?gameId=${lobby.key}&name=${playerName}`}
          target='_top'
        >
          Click to join {playerName}'s lobby
        </a>
      }
    },
    {
      title: 'Game Type',
      dataIndex: 'gameType',
      key: 'key',
      render: (gameType: string) => {
        return gameType
      }
    }
  ];


  return <Table
    dataSource={dataSource}
    columns={columns}
    locale={{emptyText: 'No Lobbies. Please Press "Create Game".'}}/>
}

export default Lobbies;