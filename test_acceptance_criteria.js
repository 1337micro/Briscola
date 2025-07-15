// Comprehensive test for all acceptance criteria
import { Game } from './briscola/js/Game.js';
import { Constants } from './briscola/js/Constants.js';
import { Hand } from './briscola/js/Hand.js';

console.log('=== BRISCOLA 500 VARIANT ACCEPTANCE CRITERIA TESTS ===\n');

// Test 1: Game can be initialized with either traditional (3 cards) or Briscola 500 (5 cards) variant
console.log('1. Testing game initialization with variants:');

const traditionalGame = new Game();
traditionalGame.init();
console.log(`   Traditional (default): ${traditionalGame.gameVariant} - ${traditionalGame.player1.hand.cards.length} cards per player`);

const traditionalGameExplicit = new Game({ gameVariant: Constants.gameVariants.TRADITIONAL });
traditionalGameExplicit.init();
console.log(`   Traditional (explicit): ${traditionalGameExplicit.gameVariant} - ${traditionalGameExplicit.player1.hand.cards.length} cards per player`);

const briscola500Game = new Game({ gameVariant: Constants.gameVariants.BRISCOLA_500 });
briscola500Game.init();
console.log(`   Briscola 500: ${briscola500Game.gameVariant} - ${briscola500Game.player1.hand.cards.length} cards per player`);

const test1Pass = traditionalGame.player1.hand.cards.length === 3 && 
                  traditionalGameExplicit.player1.hand.cards.length === 3 && 
                  briscola500Game.player1.hand.cards.length === 5;
console.log(`   ✓ Test 1: ${test1Pass ? 'PASS' : 'FAIL'}\n`);

// Test 2: Hand size limits are correctly enforced based on the selected variant
console.log('2. Testing hand size limits enforcement:');

let test2Pass = true;
try {
    const traditionalHand = new Hand(Constants.gameVariants.TRADITIONAL);
    for (let i = 0; i < 3; i++) traditionalHand.addCard(traditionalGame.deck.drawCard());
    traditionalHand.addCard(traditionalGame.deck.drawCard()); // Should fail
    test2Pass = false;
    console.log('   ✗ Traditional hand limit: FAIL (should have thrown error)');
} catch (error) {
    console.log('   ✓ Traditional hand limit: PASS (correctly rejected 4th card)');
}

try {
    const briscola500Hand = new Hand(Constants.gameVariants.BRISCOLA_500);
    for (let i = 0; i < 5; i++) briscola500Hand.addCard(briscola500Game.deck.drawCard());
    briscola500Hand.addCard(briscola500Game.deck.drawCard()); // Should fail
    test2Pass = false;
    console.log('   ✗ Briscola 500 hand limit: FAIL (should have thrown error)');
} catch (error) {
    console.log('   ✓ Briscola 500 hand limit: PASS (correctly rejected 6th card)');
}

console.log(`   ✓ Test 2: ${test2Pass ? 'PASS' : 'FAIL'}\n`);

// Test 3: Initial card dealing works correctly for both variants
console.log('3. Testing initial card dealing:');

const test3Pass = traditionalGame.player1.hand.cards.length === 3 && 
                  traditionalGame.player2.hand.cards.length === 3 &&
                  briscola500Game.player1.hand.cards.length === 5 && 
                  briscola500Game.player2.hand.cards.length === 5;
console.log(`   Traditional: P1=${traditionalGame.player1.hand.cards.length}, P2=${traditionalGame.player2.hand.cards.length} cards`);
console.log(`   Briscola 500: P1=${briscola500Game.player1.hand.cards.length}, P2=${briscola500Game.player2.hand.cards.length} cards`);
console.log(`   ✓ Test 3: ${test3Pass ? 'PASS' : 'FAIL'}\n`);

// Test 4: All existing game logic continues to work with both variants
console.log('4. Testing game logic with both variants:');

// Test traditional variant game logic
let traditionalRounds = 0;
const traditionalTestGame = new Game();
traditionalTestGame.init();
let test4TraditionalPass = true;
try {
    while (traditionalRounds < 5 && !traditionalTestGame.isGameOver()) {
        traditionalTestGame._playRound();
        traditionalRounds++;
    }
    console.log(`   Traditional: Completed ${traditionalRounds} rounds successfully`);
} catch (error) {
    console.log(`   Traditional: FAIL after ${traditionalRounds} rounds - ${error.message}`);
    test4TraditionalPass = false;
}

// Test Briscola 500 variant game logic
let briscola500Rounds = 0;
const briscola500TestGame = new Game({ gameVariant: Constants.gameVariants.BRISCOLA_500 });
briscola500TestGame.init();
let test4Briscola500Pass = true;
try {
    while (briscola500Rounds < 5 && !briscola500TestGame.isGameOver()) {
        briscola500TestGame._playRound();
        briscola500Rounds++;
    }
    console.log(`   Briscola 500: Completed ${briscola500Rounds} rounds successfully`);
} catch (error) {
    console.log(`   Briscola 500: FAIL after ${briscola500Rounds} rounds - ${error.message}`);
    test4Briscola500Pass = false;
}

const test4Pass = test4TraditionalPass && test4Briscola500Pass;
console.log(`   ✓ Test 4: ${test4Pass ? 'PASS' : 'FAIL'}\n`);

// Test 5: Backward compatibility is maintained
console.log('5. Testing backward compatibility:');

let test5Pass = true;
try {
    // Test that existing code using default constructor works unchanged
    const legacyGame = new Game();
    legacyGame.init();
    
    // Test that Hand created without variant parameter works
    const legacyHand = new Hand({});
    legacyHand.addCard(legacyGame.deck.drawCard());
    
    // Test that old-style code works
    let legacyRounds = 0;
    while (legacyRounds < 3 && !legacyGame.isGameOver()) {
        legacyGame._playRound();
        legacyRounds++;
    }
    
    console.log(`   Legacy code: Completed ${legacyRounds} rounds with ${legacyGame.gameVariant} variant`);
    console.log(`   Legacy hand: Max cards ${legacyHand.maxCards}, variant ${legacyHand.gameVariant}`);
} catch (error) {
    console.log(`   Legacy code: FAIL - ${error.message}`);
    test5Pass = false;
}

console.log(`   ✓ Test 5: ${test5Pass ? 'PASS' : 'FAIL'}\n`);

// Summary
const allTestsPass = test1Pass && test2Pass && test3Pass && test4Pass && test5Pass;
console.log('=== SUMMARY ===');
console.log(`All acceptance criteria tests: ${allTestsPass ? 'PASS' : 'FAIL'}`);

if (allTestsPass) {
    console.log('\n🎉 All tests passed! Briscola 500 variant implementation is complete and working correctly.');
} else {
    console.log('\n❌ Some tests failed. Please review the implementation.');
}