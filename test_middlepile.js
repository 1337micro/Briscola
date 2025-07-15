// Test MiddlePile creation issue
import { Game } from './briscola/js/Game.js';
import { MiddlePile } from './briscola/js/MiddlePile.js';

console.log('Testing MiddlePile creation...\n');

let game = new Game();
game.init();

console.log(`Initial middlePile trumpCard: ${game.middlePile.trumpCard ? game.middlePile.trumpCard.rank + game.middlePile.trumpCard.suit : 'undefined'}`);
console.log(`Initial middlePile cards length: ${game.middlePile.cards.length}`);

// Simulate what happens in _playRound line 205
let newMiddlePile = new MiddlePile(game.middlePile);
console.log(`New middlePile trumpCard: ${newMiddlePile.trumpCard ? newMiddlePile.trumpCard.rank + newMiddlePile.trumpCard.suit : 'undefined'}`);
console.log(`New middlePile cards length: ${newMiddlePile.cards.length}`);

// Try to add cards and determine winner
const firstCard = game.player1.hand.cards[0];
const secondCard = game.player2.hand.cards[0];

newMiddlePile.addCard(firstCard);
newMiddlePile.addCard(secondCard);

console.log(`After adding cards, middlePile is complete: ${newMiddlePile.isPileComplete()}`);

try {
    const winningCard = newMiddlePile.decideWinningCard();
    console.log(`Winning card: ${winningCard.rank}${winningCard.suit}`);
    console.log(`✓ MiddlePile test: PASS`);
} catch (error) {
    console.log(`✗ MiddlePile test: FAIL - ${error.toString()}`);
}