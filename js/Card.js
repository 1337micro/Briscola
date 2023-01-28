"use strict";
function Card(cardState = {})
{
  let state = {
    rank: cardState.rank,
    points: cardState.points,
    suit: cardState.suit
  }
  return Object.assign(state, equals(state))
}
function equals(state){
  return {
    equals: function(otherCard)
    {
      return state.rank === otherCard.rank && state.suit === otherCard.suit
    }
  }
}
export { Card }
