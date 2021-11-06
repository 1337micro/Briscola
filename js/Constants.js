const Constants = {
  width:800,
  height:600,
    events: {
        REQUEST_GAME_START:"REQUEST_GAME_START",
        REQUEST_SINGLE_PLAYER_GAME_START:"REQUEST_SINGLE_PLAYER_GAME_START",
        UPDATE_GAME: "UPDATE_GAME",
        PLAYER_JOINED: "PLAYER_JOINED",
        PLAYER_LEFT: "PLAYER_LEFT",
        CARD_PLAYED: "CARD_PLAYED",
        CARD_PLAYED_CONFIRMED:"CARD_PLAYED_CONFIRMED",
        CARD_PLAYED_REJECTED:"CARD_PLAYED_REJECTED",
        GAME_OVER:"GAME_OVER",
        ROUND_OVER: "ROUND_OVER",
        LAST_DEAL: "LAST_DEAL",
        GAME_START: "GAME_START",
        GET_GAME:"GET_GAME",
        TRUMP_CARD: "TRUMP_CARD",

        REDIRECT: "REDIRECT"
    },
    soundUrl:
    {
      SHUFFLE_CARDS: "sound/cardShuffle.wav",
      PLAY_CARD: "sound/playCard.wav"
    },
      gameConstants:
      {
          NUMBER_OF_PLAYERS : 2,
          LIST_OF_STRENGTHS_BY_RANK: [1, 3, 10, 9, 8, 7, 6,5,4,3,2],
          MAP_RANK_TO_NUMBER_OF_POINTS: {
            1: 11,
            3: 10,
            10: 4,
            9: 3,
            8: 2
          },
          MAX_NUMBER_CARDS_IN_HAND: 3
      }
}
export { Constants };
