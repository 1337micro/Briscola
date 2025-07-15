// Simple test to verify Briscola variant support
import { Game } from './briscola/js/Game.js';
import { Constants } from './briscola/js/Constants.js';

console.log('Testing Briscola variant support...\n');

// Test traditional variant (default)
console.log('1. Testing traditional variant (default):');
const traditionalGame = new Game();
traditionalGame.init();
console.log(`   Game variant: ${traditionalGame.gameVariant}`);
console.log(`   Player 1 hand size: ${traditionalGame.player1.hand.cards.length}`);
console.log(`   Player 2 hand size: ${traditionalGame.player2.hand.cards.length}`);
console.log(`   Expected: 3 cards each`);
console.log(`   ✓ Traditional variant working: ${traditionalGame.player1.hand.cards.length === 3 && traditionalGame.player2.hand.cards.length === 3 ? 'PASS' : 'FAIL'}\n`);

// Test traditional variant (explicit)
console.log('2. Testing traditional variant (explicit):');
const traditionalGameExplicit = new Game({ gameVariant: Constants.gameVariants.TRADITIONAL });
traditionalGameExplicit.init();
console.log(`   Game variant: ${traditionalGameExplicit.gameVariant}`);
console.log(`   Player 1 hand size: ${traditionalGameExplicit.player1.hand.cards.length}`);
console.log(`   Player 2 hand size: ${traditionalGameExplicit.player2.hand.cards.length}`);
console.log(`   Expected: 3 cards each`);
console.log(`   ✓ Traditional variant explicit working: ${traditionalGameExplicit.player1.hand.cards.length === 3 && traditionalGameExplicit.player2.hand.cards.length === 3 ? 'PASS' : 'FAIL'}\n`);

// Test Briscola 500 variant
console.log('3. Testing Briscola 500 variant:');
const briscola500Game = new Game({ gameVariant: Constants.gameVariants.BRISCOLA_500 });
briscola500Game.init();
console.log(`   Game variant: ${briscola500Game.gameVariant}`);
console.log(`   Player 1 hand size: ${briscola500Game.player1.hand.cards.length}`);
console.log(`   Player 2 hand size: ${briscola500Game.player2.hand.cards.length}`);
console.log(`   Expected: 5 cards each`);
console.log(`   ✓ Briscola 500 variant working: ${briscola500Game.player1.hand.cards.length === 5 && briscola500Game.player2.hand.cards.length === 5 ? 'PASS' : 'FAIL'}\n`);

// Test hand limits
console.log('4. Testing hand size limits:');
try {
    const traditionalHand = traditionalGame.player1.hand;
    traditionalHand.addCard(traditionalGame.deck.drawCard()); // Should fail - hand already at max (3)
    console.log('   ✗ Traditional hand limit test: FAIL (should have thrown error)');
} catch (error) {
    console.log('   ✓ Traditional hand limit test: PASS (correctly rejected 4th card)');
}

try {
    const briscola500Hand = briscola500Game.player1.hand;
    // Hand already has 5 cards, try to add one more
    briscola500Hand.addCard(briscola500Game.deck.drawCard()); // Should fail - hand already at max (5)
    console.log('   ✗ Briscola 500 hand limit test: FAIL (should have thrown error)');
} catch (error) {
    console.log('   ✓ Briscola 500 hand limit test: PASS (correctly rejected 6th card)');
}

console.log('\nAll tests completed!');