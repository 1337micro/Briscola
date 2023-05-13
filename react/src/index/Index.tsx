import Lobbies from "../lobbies/Lobbies";

import './Index.css'

function Index() {
  return (
    <div className='Index'>
      <Lobbies/>
      <div className='wrap'>
        <div className='cards-img-container'>
          <img src="../../public/cards.png" alt="Cards image"/>
        </div>
      </div>
    </div>
  )
}

export default Index;