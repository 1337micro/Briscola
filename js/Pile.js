"use strict";
import { CardList } from "./CardList";
/**
 * A super-class middlePile. Represents the cards won by some player. For the middlePile of cards in the middle, see MiddlePile.js
 * @param cards an array of card objects
 * @constructor
 */
function Pile(pileState = {})
{
    let state = {
        cards:pileState.cards
    }
    return Object.assign(state, CardList(state))
}
export { Pile }