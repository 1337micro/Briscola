// Test full round properly
import { Game } from './briscola/js/Game.js';
import { Constants } from './briscola/js/Constants.js';

console.log('Testing proper round play...\n');

// Test traditional variant
console.log('1. Testing traditional variant:');
let game = new Game();
game.init();

console.log(`   Initial setup:`);
console.log(`   - Player 1 hand size: ${game.player1.hand.cards.length}`);
console.log(`   - Player 2 hand size: ${game.player2.hand.cards.length}`);
console.log(`   - Deck size: ${game.deck.cards.length}`);

try {
    game._playRound();
    console.log(`   After first round:`);
    console.log(`   - Player 1 hand size: ${game.player1.hand.cards.length}`);
    console.log(`   - Player 2 hand size: ${game.player2.hand.cards.length}`);
    console.log(`   - Deck size: ${game.deck.cards.length}`);
    console.log(`   ✓ Traditional round: PASS`);
} catch (error) {
    console.log(`   ✗ Traditional round: FAIL - ${error.toString()}`);
    console.log(`   Stack: ${error.stack}`);
}

// Test Briscola 500 variant
console.log('\n2. Testing Briscola 500 variant:');
let game500 = new Game({ gameVariant: Constants.gameVariants.BRISCOLA_500 });
game500.init();

console.log(`   Initial setup:`);
console.log(`   - Player 1 hand size: ${game500.player1.hand.cards.length}`);
console.log(`   - Player 2 hand size: ${game500.player2.hand.cards.length}`);
console.log(`   - Deck size: ${game500.deck.cards.length}`);

try {
    game500._playRound();
    console.log(`   After first round:`);
    console.log(`   - Player 1 hand size: ${game500.player1.hand.cards.length}`);
    console.log(`   - Player 2 hand size: ${game500.player2.hand.cards.length}`);
    console.log(`   - Deck size: ${game500.deck.cards.length}`);
    console.log(`   ✓ Briscola 500 round: PASS`);
} catch (error) {
    console.log(`   ✗ Briscola 500 round: FAIL - ${error.message}`);
}

console.log('\n3. Testing multiple rounds:');
let multiGame = new Game();
multiGame.init();
let rounds = 0;
try {
    while (rounds < 5 && !multiGame.isGameOver()) {
        multiGame._playRound();
        rounds++;
        console.log(`   Round ${rounds}: P1=${multiGame.player1.hand.cards.length} cards, P2=${multiGame.player2.hand.cards.length} cards, Deck=${multiGame.deck.cards.length}`);
    }
    console.log(`   ✓ Multiple rounds: PASS`);
} catch (error) {
    console.log(`   ✗ Multiple rounds: FAIL after ${rounds} rounds - ${error.message}`);
}