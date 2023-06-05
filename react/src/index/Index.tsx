import { Row, Col, Button } from "antd";
import Lobbies from "../lobbies/Lobbies";
import {useState} from "react";

import "./Index.css";
import CreateButton from "../components/modal";

function Index() {

  function handleCreateGame(playerName: string) {
    window.open(
      `http://${window.location.hostname}:80/new?name=${playerName}`,
      "_top"
    );
  }

  function handlePlayAgainstComputer() {
    window.open(
      `http://${window.location.hostname}:80/newAgainstComputer`,
      "_top"
    );
  }

  return (
    <Row className="Index" justify="center">
      <Col>
        <Row justify="center">
          <Col>
            <h1 className="logo">Briscola</h1>
          </Col>
        </Row>

        <Row style={{ marginBottom: 40 }} justify="center">
          <Col>
            <CreateButton onOk={handleCreateGame}/>
          </Col>
          <Col>
            <Button
              type="link"
              className="primary-button"
              size="large"
              onClick={handlePlayAgainstComputer}
            >
              Play Against Computer
            </Button>
          </Col>
        </Row>

        <Lobbies />
        <div className="wrap">
          <div className="cards-img-container">
            <img src="./cards.png" alt="Cards image" />
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default Index;

