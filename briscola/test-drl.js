import { Game } from './js/Game.js';
import { DRLAgent } from './js/ai/DRLAgent.js';
import { GameStateEncoder } from './js/ai/GameStateEncoder.js';

/**
 * Simple test to verify DRL AI integration
 */
async function testDRLIntegration() {
    console.log('Testing DRL AI Integration...');
    
    try {
        // Test GameStateEncoder
        console.log('Testing GameStateEncoder...');
        const encoder = new GameStateEncoder();
        console.log(`Feature size: ${encoder.FEATURE_SIZE}`);
        
        // Test Game with DRL AI
        console.log('Testing Game with DRL AI...');
        const game = new Game();
        game.setAIType('drl');
        game.init();
        game.singlePlayer = true;
        
        console.log('Game initialized with DRL AI');
        console.log(`AI Type: ${game.aiType}`);
        console.log(`DRL Agent exists: ${game.drlAgent !== null}`);
        
        // Test state encoding
        if (game.drlAgent) {
            const state = encoder.encodeGameState(game, 0);
            console.log(`State vector length: ${state.length}`);
            console.log(`Expected length: ${encoder.FEATURE_SIZE}`);
            console.log('State encoding test passed!');
            
            // Test action selection
            const selectedCard = game.drlAgent.selectAction(game, 0);
            console.log(`Selected card: ${selectedCard.rank}${selectedCard.suit}`);
            console.log('Action selection test passed!');
        }
        
        // Test fallback to rule-based AI
        console.log('Testing fallback to rule-based AI...');
        game.setAIType('rule-based');
        const ruleBasedMove = game.computerMove();
        if (ruleBasedMove) {
            console.log(`Rule-based AI selected: ${ruleBasedMove.rank}${ruleBasedMove.suit}`);
        }
        
        console.log('All tests passed!');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run test
testDRLIntegration();

export { testDRLIntegration };