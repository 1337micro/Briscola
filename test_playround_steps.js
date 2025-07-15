// Test exact _playRound steps
import { Game } from './briscola/js/Game.js';
import { MiddlePile } from './briscola/js/MiddlePile.js';
import { Constants } from './briscola/js/Constants.js';

console.log('Testing exact _playRound steps...\n');

let game = new Game();
game.init();

console.log(`Initial state:`);
console.log(`- currentPlayerToActByIndex: ${game.currentPlayerToActByIndex}`);
console.log(`- Player 1 hand size: ${game.player1.hand.cards.length}`);
console.log(`- Player 2 hand size: ${game.player2.hand.cards.length}`);
console.log(`- MiddlePile trumpCard: ${game.middlePile.trumpCard ? game.middlePile.trumpCard.rank + game.middlePile.trumpCard.suit : 'undefined'}`);

// Follow _playRound steps exactly
const currentPlayerToActByIndex = game.currentPlayerToActByIndex
const otherPlayerToActByIndex = (currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS

console.log(`- currentPlayerToActByIndex: ${currentPlayerToActByIndex}`);
console.log(`- otherPlayerToActByIndex: ${otherPlayerToActByIndex}`);

const currentPlayerToAct = game.players[currentPlayerToActByIndex]
const otherPlayer = game.players[otherPlayerToActByIndex]

console.log(`Step 1: Create new MiddlePile`);
game.middlePile = new MiddlePile(game.middlePile)
console.log(`- New middlePile trumpCard: ${game.middlePile.trumpCard ? game.middlePile.trumpCard.rank + game.middlePile.trumpCard.suit : 'undefined'}`);

console.log(`Step 2: Players play cards`);
const firstCardPlayed = currentPlayerToAct.hand.cards.pop()
console.log(`- First card played: ${firstCardPlayed.rank}${firstCardPlayed.suit}`);
game.addCardToHistory(firstCardPlayed, currentPlayerToActByIndex)

const secondCardPlayed = otherPlayer.hand.cards.pop()
console.log(`- Second card played: ${secondCardPlayed.rank}${secondCardPlayed.suit}`);
game.addCardToHistory(secondCardPlayed, otherPlayerToActByIndex)

console.log(`Step 3: Add cards to middle pile`);
game.middlePile.addCard(firstCardPlayed)
game.middlePile.addCard(secondCardPlayed)
console.log(`- MiddlePile cards: ${game.middlePile.cards.length}`);
console.log(`- MiddlePile complete: ${game.middlePile.isPileComplete()}`);

console.log(`Step 4: Determine winner`);
try {
    let winningPlayer = game.getWinningPlayer()
    let winningPlayerIndex = game.getWinningPlayerIndex()
    console.log(`- Winning player index: ${winningPlayerIndex}`);
    
    console.log(`Step 5: Update game state`);
    game.currentPlayerToActByIndex = winningPlayerIndex
    game.firstPlayerToActByIndex = game.currentPlayerToActByIndex;
    winningPlayer.pile.addCards(game.middlePile.cards)
    game.middlePile.reset()
    
    console.log(`Step 6: Deal next cards`);
    if (!game.isDeckEmpty()) {
        console.log(`- Deck not empty, dealing next cards...`);
        console.log(`- Current middlePile trumpCard before dealing: ${game.middlePile.trumpCard ? game.middlePile.trumpCard.rank + game.middlePile.trumpCard.suit : 'undefined'}`);
        game.dealNextCardToAllPlayers()
        console.log(`✓ All steps completed successfully`);
    } else {
        console.log(`- Deck empty, no more cards to deal`);
    }
} catch (error) {
    console.log(`✗ Error at step 4 or later: ${error.toString()}`);
    console.log(`Stack: ${error.stack}`);
}