import {Row, Col, Button} from 'antd';
import Lobbies from "../lobbies/Lobbies";

import './Index.css'


function Index() {
  const playerName = 'Anonymous' // add antd Modal which will take playerName input

  return (
    <Row className='Index' justify='center'>
      <Col>
        <Row justify='center'>
          <Col>
            <h1 className="logo">Briscola</h1>
          </Col>
        </Row>

        <Row style={{marginBottom: 40}} justify='center'>
          <Col>
            <Button
              type="link"
              className='primary-button'
              size='large'
            >
              <a href={`http://${window.location.hostname}:80/new?name=${playerName}`} target='_top'>Create Game</a>
            </Button>
          </Col>
          <Col>
            <Button
              type="link"
              className='primary-button'
              size='large'
            >
              <a href={`http://${window.location.hostname}:80/newAgainstComputer`} target='_top'>Play Against Computer</a>
            </Button>
          </Col>
        </Row>

        <Lobbies/>
        <div className='wrap'>
          <div className='cards-img-container'>
            <img src="./cards.png" alt="Cards image"/>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default Index;