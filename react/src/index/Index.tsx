import { Button } from "antd";
import Lobbies from "../lobbies/Lobbies";

import "./Index.css";
import CreateButton from "../components/modal";

function Index() {

  function handleCreateGame(playerName: string) {
    window.open(
      `http://${window.location.hostname}:80/new?name=${playerName}`,
      "_top"
    );
  }

  function handleCreateGameBriscola500(playerName: string) {
    window.open(
      `http://${window.location.hostname}:80/new?name=${playerName}&gameType=500`,
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
    <div className="Index">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-glow" />
        <h1 className="logo">
          <span className="logo-icon">♠</span> Briscola
        </h1>
        <p className="tagline">The classic Italian card game — play with friends or challenge the AI</p>
      </header>

      {/* Action Cards */}
      <section className="actions-section">
        <div className="action-cards">
          <div className="action-card">
            <div className="action-card-icon">⚡</div>
            <h3>Briscola 300</h3>
            <p>Classic rules</p>
            <CreateButton onOk={handleCreateGame} />
          </div>

          <div className="action-card">
            <div className="action-card-icon">🏆</div>
            <h3>Briscola 500</h3>
            <p>Five-card Briscola</p>
            <CreateButton onOk={handleCreateGameBriscola500} buttonText="Create Briscola 500 Game" />
          </div>

          <div className="action-card">
            <div className="action-card-icon">🤖</div>
            <h3>Play vs AI</h3>
            <p>Practice against the computer opponent.</p>
            <Button
              type="primary"
              className="primary-button"
              size="large"
              onClick={handlePlayAgainstComputer}
            >
              Play Against AI
            </Button>
          </div>
        </div>
      </section>

      {/* Lobbies Section */}
      <section className="lobbies-section">
        <h2 className="section-title">Open Lobbies</h2>
        <div className="lobbies-card">
          <Lobbies />
        </div>
      </section>

      {/* Footer image */}
      <footer className="footer-art">
        <img src="./cards.png" alt="Cards" className="cards-img" />
      </footer>
    </div>
  );
}

export default Index;

