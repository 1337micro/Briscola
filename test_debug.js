// Debug test to understand the Hand creation flow
import { Game } from './briscola/js/Game.js';
import { Hand } from './briscola/js/Hand.js';
import { Constants } from './briscola/js/Constants.js';

console.log('Debug test for Hand creation...\n');

// Test Hand constructor backward compatibility
console.log('1. Testing Hand constructor backward compatibility:');
const oldStyleHand = new Hand({});  // Old style - handState as first parameter
console.log(`   Old style hand max cards: ${oldStyleHand.maxCards}`);
console.log(`   Old style hand variant: ${oldStyleHand.gameVariant}`);

const newStyleHand = new Hand(Constants.gameVariants.BRISCOLA_500, {});  // New style
console.log(`   New style hand max cards: ${newStyleHand.maxCards}`);
console.log(`   New style hand variant: ${newStyleHand.gameVariant}\n`);

// Test Game creation and initialization
console.log('2. Testing Game creation:');
let game = new Game();
console.log(`   Before init - game variant: ${game.gameVariant}`);
console.log(`   Before init - player1 hand variant: ${game.player1.hand.gameVariant}`);
console.log(`   Before init - player1 hand max: ${game.player1.hand.maxCards}`);

game.init();
console.log(`   After init - game variant: ${game.gameVariant}`);
console.log(`   After init - player1 hand variant: ${game.player1.hand.gameVariant}`);
console.log(`   After init - player1 hand max: ${game.player1.hand.maxCards}`);
console.log(`   After init - player1 hand size: ${game.player1.hand.cards.length}\n`);

// Test a single round
console.log('3. Testing single round:');
console.log(`   Before round - player1 hand size: ${game.player1.hand.cards.length}`);
console.log(`   Before round - player2 hand size: ${game.player2.hand.cards.length}`);
console.log(`   Before round - deck size: ${game.deck.cards.length}`);

// Manually play one round to see what happens
const currentPlayerToActByIndex = game.currentPlayerToActByIndex
const otherPlayerToActByIndex = (currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS

const currentPlayerToAct = game.players[currentPlayerToActByIndex]
const otherPlayer = game.players[otherPlayerToActByIndex]

const firstCardPlayed = currentPlayerToAct.hand.cards.pop()
const secondCardPlayed = otherPlayer.hand.cards.pop()

console.log(`   After playing cards - player1 hand size: ${game.player1.hand.cards.length}`);
console.log(`   After playing cards - player2 hand size: ${game.player2.hand.cards.length}`);

// Now try to deal next cards
if (!game.isDeckEmpty()) {
    console.log(`   Dealing next cards...`);
    try {
        game.dealNextCardToAllPlayers();
        console.log(`   After dealing - player1 hand size: ${game.player1.hand.cards.length}`);
        console.log(`   After dealing - player2 hand size: ${game.player2.hand.cards.length}`);
        console.log(`   ✓ Single round test: PASS`);
    } catch (error) {
        console.log(`   ✗ Single round test: FAIL - ${error.message}`);
        console.log(`   Full error: ${error.toString()}`);
        console.log(`   Stack: ${error.stack}`);
    }
}