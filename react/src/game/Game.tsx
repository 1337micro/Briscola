import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Game.css';

/* Socket.IO v2 is loaded as a global script in game.html */
declare function io(url: string): SocketIOInstance;

interface SocketIOInstance {
  on(event: string, cb: (...args: unknown[]) => void): void;
  emit(event: string, data?: unknown): void;
  disconnect(): void;
}

interface Card {
  rank: number;
  suit: string;
}

interface Hand {
  cards: Card[];
}

interface Pile {
  cards: Card[];
}

interface PlayerState {
  socketId: string;
  name: string;
  hand: Hand;
  pile: Pile;
  points: number;
}

interface GameState {
  playerForClientSide: PlayerState;
  players: PlayerState[];
  currentPlayerToActByIndex: number;
  deck: { cards: Card[] };
  trumpSuit: string | null;
  trumpCard: Card | null;
  gameType: string | null;
}

interface PileCardEntry {
  id: string;
  rank: number;
  suit: string;
  /** Random horizontal offset in px relative to center */
  offsetX: number;
  /** Random rotation in radians */
  rotation: number;
}

// ─── Constants (mirrored from briscola/js/Constants.js) ──────────────────────

const EVENTS = {
  REQUEST_GAME_START: 'REQUEST_GAME_START',
  REQUEST_SINGLE_PLAYER_GAME_START: 'REQUEST_SINGLE_PLAYER_GAME_START',
  UPDATE_GAME: 'UPDATE_GAME',
  PLAYER_LEFT: 'PLAYER_LEFT',
  CARD_PLAYED: 'CARD_PLAYED',
  COMPUTER_CARD_PLAYED: 'COMPUTER_CARD_PLAYED',
  FIRST_TO_ACT_COMPUTER_CARD_PLAYED: 'FIRST_TO_ACT_COMPUTER_CARD_PLAYED',
  CARD_PLAYED_CONFIRMED: 'CARD_PLAYED_CONFIRMED',
  CARD_PLAYED_REJECTED: 'CARD_PLAYED_REJECTED',
  GAME_OVER: 'GAME_OVER',
  ROUND_OVER: 'ROUND_OVER',
  LAST_DEAL: 'LAST_DEAL',
  GET_GAME: 'GET_GAME',
  CALL_BRISK: 'CALL_BRISK',
  BRISK_CALLED: 'BRISK_CALLED',
  MISDEAL: 'MISDEAL',
  REDIRECT: 'REDIRECT',
} as const;

const SUIT_MAP: Record<string, string> = {
  s: 'Spade',
  c: 'Coppe',
  d: 'Denari',
  b: 'Bastoni',
};

const RANK_POINTS: Record<number, number> = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };

const HORSE_RANK = 9;
const KING_RANK = 10;
const BRISCOLA_500 = '500';
const NUMBER_OF_PLAYERS = 2;

// ─── Card skins ──────────────────────────────────────────────────────────────

const CARD_SKINS: Record<string, { label: string; path: string }> = {
  classic: { label: 'Classic', path: '/images' },
  trevisane: { label: 'Trevisane', path: '/images/trevisane' },
};

const CARD_SKIN_STORAGE_KEY = 'cardSkin';

function getInitialCardSkin(): string {
  try {
    const saved = localStorage.getItem(CARD_SKIN_STORAGE_KEY);
    if (saved && CARD_SKINS[saved]) return saved;
  } catch { /* storage unavailable */ }
  return 'classic';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUrlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function isSinglePlayer(): boolean {
  return !!getUrlParam('singlePlayer');
}

function getLobbyName(): string {
  return getUrlParam('name') ?? '';
}

function getGameId(): string {
  return getUrlParam('gameId') ?? '';
}

function getOpponentPlayer(game: GameState): PlayerState {
  const me = game.playerForClientSide;
  return game.players[0].socketId === me.socketId ? game.players[1] : game.players[0];
}

function isMyTurnToAct(game: GameState): boolean {
  const acting = game.players[game.currentPlayerToActByIndex];
  const me = game.playerForClientSide;
  return !!(acting && me && acting.socketId === me.socketId);
}

function findHorseKingSuits(hand: Hand): string[] {
  const suitRanks: Record<string, Set<number>> = {};
  for (const card of hand.cards) {
    if (card.rank === HORSE_RANK || card.rank === KING_RANK) {
      if (!suitRanks[card.suit]) suitRanks[card.suit] = new Set();
      suitRanks[card.suit].add(card.rank);
    }
  }
  return Object.keys(suitRanks).filter(
    (s) => suitRanks[s].has(HORSE_RANK) && suitRanks[s].has(KING_RANK),
  );
}

function countHandPoints(hand: Hand): number {
  if (!hand?.cards) return 0;
  return hand.cards.reduce((sum, c) => sum + (RANK_POINTS[c.rank] ?? 0), 0);
}

function isFirstRound(game: GameState): boolean {
  return game.players.every((p) => !p.pile?.cards?.length);
}

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = 'waiting' | 'playing' | 'gameover' | 'connectionLost' | 'opponentLeft';

let pileIdCounter = 0;

const Game: React.FC = () => {
  const socketRef = useRef<SocketIOInstance | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [phase, setPhase] = useState<Phase>('waiting');
  const [game, setGame] = useState<GameState | null>(null);
  const [middlePileCards, setMiddlePileCards] = useState<PileCardEntry[]>([]);
  const [showTrumpCard, setShowTrumpCard] = useState(true);
  const [showBackOfDeck, setShowBackOfDeck] = useState(true);
  const [briskCalledSuit, setBriskCalledSuit] = useState<string | null>(null);
  const [gameOverData, setGameOverData] = useState<GameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Prevents the player from clicking a second card while awaiting confirmation */
  const [pendingPlay, setPendingPlay] = useState(false);
  const [cardSkin, setCardSkin] = useState<string>(getInitialCardSkin);
  const [copied, setCopied] = useState(false);
  const inviteInputRef = useRef<HTMLInputElement | null>(null);

  const cardImage = useCallback(
    (rank: number, suit: string) => `${CARD_SKINS[cardSkin].path}/${rank}${suit}.png`,
    [cardSkin],
  );

  const handleSkinChange = useCallback((skin: string) => {
    setCardSkin(skin);
    try {
      localStorage.setItem(CARD_SKIN_STORAGE_KEY, skin);
    } catch { /* storage unavailable */ }
  }, []);

  const playCardAudioRef = useRef<HTMLAudioElement | null>(null);
  const shuffleAudioRef = useRef<HTMLAudioElement | null>(null);

  const playCardSound = useCallback(() => {
    if (playCardAudioRef.current) {
      playCardAudioRef.current.currentTime = 0;
      playCardAudioRef.current.play().catch(() => { /* autoplay blocked */ });
    }
  }, []);

  const playShuffleSound = useCallback(() => {
    if (shuffleAudioRef.current) {
      shuffleAudioRef.current.currentTime = 0;
      shuffleAudioRef.current.play().catch(() => { /* autoplay blocked */ });
    }
  }, []);

  const addPileCard = useCallback((card: Card) => {
    const entry: PileCardEntry = {
      id: `pile-${pileIdCounter++}`,
      rank: card.rank,
      suit: card.suit,
      offsetX: 185 * Math.random(),
      rotation: Math.random() / 2,
    };
    setMiddlePileCards((prev) => [...prev, entry]);
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const copyInviteLink = useCallback(async () => {
    const url = window.location.href;
    let ok = false;
    // navigator.clipboard only exists in a secure context (HTTPS/localhost).
    // The game is served over plain HTTP, so fall back to selecting the input
    // and using the legacy execCommand('copy'), which works without HTTPS.
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        ok = true;
      } catch { /* fall through to legacy path */ }
    }
    if (!ok && inviteInputRef.current) {
      const input = inviteInputRef.current;
      input.focus();
      input.select();
      input.setSelectionRange(0, url.length);
      try {
        ok = document.execCommand('copy');
      } catch { /* clipboard unavailable */ }
      input.blur();
    }
    if (ok) {
      setCopied(true);
      scheduleTimeout(() => setCopied(false), 2000);
    }
  }, [scheduleTimeout]);

  useEffect(() => {
    // ── Sounds ──
    playCardAudioRef.current = new Audio('/sound/playCard.wav');
    playCardAudioRef.current.volume = 0.35;
    shuffleAudioRef.current = new Audio('/sound/cardShuffle.wav');
    shuffleAudioRef.current.volume = 0.25;

    // ── Socket ──
    const gameId = getGameId();
    // Same-origin: the reverse proxy forwards /socket.io to the backend. A
    // hardcoded http://…:3000 would be blocked as mixed content on HTTPS.
    const socket: SocketIOInstance = io(`${window.location.origin}?gameId=${gameId}`);
    socketRef.current = socket;

    // Request game start
    if (isSinglePlayer()) {
      socket.emit(EVENTS.REQUEST_SINGLE_PLAYER_GAME_START);
    } else {
      socket.emit(EVENTS.REQUEST_GAME_START, getLobbyName());
    }

    // ── Event handlers ──

    socket.on(EVENTS.REDIRECT, (newUrl) => {
      window.location.assign(newUrl as string);
    });

    socket.on(EVENTS.GET_GAME, (gameObj) => {
      playShuffleSound();
      setGame(gameObj as GameState);
      setPhase('playing');
    });

    socket.on(EVENTS.UPDATE_GAME, (newGame) => {
      setPendingPlay(false);
      setGame(newGame as GameState);
    });

    socket.on(EVENTS.CARD_PLAYED, (card) => {
      playCardSound();
      addPileCard(card as Card);
    });

    socket.on(EVENTS.COMPUTER_CARD_PLAYED, (card) => {
      scheduleTimeout(() => {
        playCardSound();
        addPileCard(card as Card);
      }, 1000);
    });

    socket.on(EVENTS.FIRST_TO_ACT_COMPUTER_CARD_PLAYED, (card) => {
      scheduleTimeout(() => {
        playCardSound();
        addPileCard(card as Card);
      }, 2000);
    });

    socket.on(EVENTS.ROUND_OVER, () => {
      scheduleTimeout(() => {
        setMiddlePileCards((prev) => prev.slice(NUMBER_OF_PLAYERS));
      }, 3000);
    });

    socket.on(EVENTS.LAST_DEAL, () => {
      setShowTrumpCard(false);
      setShowBackOfDeck(false);
    });

    socket.on(EVENTS.GAME_OVER, (data) => {
      setGameOverData(data as GameState);
      setTimeout(() => setPhase('gameover'), 3000);
    });

    socket.on('disconnect', (reason) => {
      setErrorMessage(`Server connection lost. Game aborted. (${String(reason)})`);
      setPhase('connectionLost');
    });

    socket.on(EVENTS.PLAYER_LEFT, () => {
      setErrorMessage('Opponent left. Game aborted.');
      setPhase('opponentLeft');
    });

    socket.on(EVENTS.BRISK_CALLED, (suit) => {
      playCardSound();
      playCardSound();
      setBriskCalledSuit(suit as string);
      scheduleTimeout(() => setBriskCalledSuit(null), 3000);
    });

    socket.on(EVENTS.CARD_PLAYED_REJECTED, () => {
      setPendingPlay(false);
      console.error('Card play rejected — not your turn.');
    });

    // Copy ref value for cleanup to avoid stale-ref warning
    const capturedTimeouts = timeoutsRef.current;
    return () => {
      capturedTimeouts.forEach(clearTimeout);
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = useCallback(
    (card: Card) => {
      if (!socketRef.current || pendingPlay) return;
      setPendingPlay(true);
      socketRef.current.emit(EVENTS.CARD_PLAYED, card);
    },
    [pendingPlay],
  );

  const handleCallBrisk = useCallback((suit: string) => {
    socketRef.current?.emit(EVENTS.CALL_BRISK, suit);
  }, []);

  const handleMisdeal = useCallback(() => {
    socketRef.current?.emit(EVENTS.MISDEAL);
  }, []);

  // ── Waiting phase ──────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    if (isSinglePlayer()) {
      return (
        <div className="waiting-overlay">
          <div className="waiting-card">
            <div className="spinner" />
            <h2 className="waiting-title">Setting Up Your Game</h2>
            <p className="waiting-subtitle">Please wait while we set up your game…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="waiting-overlay">
        <div className="waiting-card">
          <div className="card-icon">♠</div>
          <h2 className="waiting-title">Waiting for Opponent</h2>
          <div className="pulse-dots">
            <span /><span /><span />
          </div>
          <p className="waiting-subtitle">Share this link to invite a friend:</p>
          <div className="url-copy-row">
            <input
              ref={inviteInputRef}
              className="url-input"
              type="text"
              readOnly
              defaultValue={window.location.href}
            />
            <button
              className="copy-btn"
              onClick={copyInviteLink}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game over ──────────────────────────────────────────────────────────────
  if (phase === 'gameover' && gameOverData) {
    const me = gameOverData.playerForClientSide;
    const opp = getOpponentPlayer(gameOverData);
    let result = 'Tie game.';
    if (me.points > opp.points) result = 'You win.';
    else if (me.points < opp.points) result = 'Opponent wins.';

    return (
      <div className="game-table">
        <div className="game-overlay">
          <div className="game-over-card">
            <h2>Game Over</h2>
            <p>Your points: {me.points}, Opponent points: {opp.points}</p>
            <p className="result">{result}</p>
            <button className="new-game-btn" onClick={() => window.location.assign('/')}>
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error states ───────────────────────────────────────────────────────────
  if (phase === 'connectionLost' || phase === 'opponentLeft') {
    return (
      <div className="game-table">
        <div className="game-overlay">
          <div className="game-over-card">
            <h2>{errorMessage}</h2>
            <button className="new-game-btn" onClick={() => window.location.assign('/')}>
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) return null;

  // ── Playing ────────────────────────────────────────────────────────────────
  const myPlayer = game.playerForClientSide;
  const opponent = getOpponentPlayer(game);
  const myTurn = isMyTurnToAct(game);
  const canClick = myTurn && !pendingPlay;
  const deckCount: number = game.deck.cards.length;
  const trumpSuitName = game.trumpSuit ? SUIT_MAP[game.trumpSuit] : 'None';
  const is500 = game.gameType === BRISCOLA_500;
  const noTrumpSet = game.trumpSuit == null;
  const callableSuits = is500 && noTrumpSet ? findHorseKingSuits(myPlayer.hand) : [];
  const showMisdealBtn = isFirstRound(game) && countHandPoints(myPlayer.hand) < 5;

  return (
    <div className="game-table">

      {/* ── Opponent's hand (back-of-cards at top) ── */}
      <div className="opponent-hand">
        {opponent.hand.cards.map((_card, i) => (
          <img
            key={i}
            src="/images/backOfCard.png"
            alt="opponent card"
            className="card"
            style={{ left: `calc(25% + ${i * 150}px)` }}
          />
        ))}
      </div>

      {/* ── Middle pile ── */}
      {middlePileCards.map((entry) => (
        <img
          key={entry.id}
          src={cardImage(entry.rank, entry.suit)}
          alt={`${entry.rank}${entry.suit}`}
          className="card pile-card"
          style={{
            left: `calc(50% - 200px + ${entry.offsetX}px)`,
            transform: `rotate(${entry.rotation}rad)`,
          }}
        />
      ))}

      {/* ── Trump card (rotated 90°, right side) ── */}
      {game.trumpCard && !is500 && showTrumpCard && (
        <img
          src={cardImage(game.trumpCard.rank, game.trumpCard.suit)}
          alt="trump card"
          className="card trump-card"
        />
      )}

      {/* ── Back of deck (right side) ── */}
      {showBackOfDeck && (
        <img
          src="/images/backOfCard.png"
          alt="deck"
          className="card back-of-deck"
        />
      )}

      {/* ── Player's hand (bottom, interactive) ── */}
      <div className="player-hand">
        {myPlayer.hand.cards.map((card, i) => (
          <img
            key={`${card.rank}${card.suit}`}
            src={cardImage(card.rank, card.suit)}
            alt={`${card.rank}${card.suit}`}
            className={`card player-card${canClick ? ' interactive' : ''}`}
            style={{ left: `calc(25% + ${i * 150}px)` }}
            onClick={() => canClick && handleCardClick(card)}
          />
        ))}
      </div>

      {/* ── Game info panel (right side) ── */}
      <div className="game-info">
        <div className="info-text turn-text">
          {myTurn ? 'Your move' : "Opponent's move"}
        </div>
        <div className="info-text deck-count">Deck: {deckCount}</div>
        <div className="info-text trump-suit">Trump Suit: {trumpSuitName}</div>
        <div className="info-text player-name">{myPlayer.name}</div>
        <select
          className="skin-select"
          value={cardSkin}
          onChange={(e) => handleSkinChange(e.target.value)}
          aria-label="Card style"
        >
          {Object.entries(CARD_SKINS).map(([key, { label }]) => (
            <option key={key} value={key}>{label} cards</option>
          ))}
        </select>
      </div>

      {/* ── Action buttons (left side) ── */}
      {(callableSuits.length > 0 || showMisdealBtn) && (
        <div className="action-buttons">
          {callableSuits.map((suit) => (
            <button
              key={suit}
              className={`action-btn brisk-btn${myTurn ? ' enabled' : ' disabled'}`}
              disabled={!myTurn}
              onClick={() => handleCallBrisk(suit)}
            >
              Call Briscola of {SUIT_MAP[suit]}
            </button>
          ))}
          {showMisdealBtn && (
            <button
              className={`action-btn misdeal-btn${myTurn ? ' enabled' : ' disabled'}`}
              disabled={!myTurn}
              onClick={handleMisdeal}
            >
              Misdeal
            </button>
          )}
        </div>
      )}

      {/* ── Brisk called announcement ── */}
      {briskCalledSuit && (
        <div className="brisk-announcement">
          <img
            src={cardImage(HORSE_RANK, briskCalledSuit)}
            alt="horse"
            className="card brisk-card"
          />
          <img
            src={cardImage(KING_RANK, briskCalledSuit)}
            alt="king"
            className="card brisk-card"
          />
          <div className="brisk-text">
            BRISCOLA of {SUIT_MAP[briskCalledSuit]} has been called
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
