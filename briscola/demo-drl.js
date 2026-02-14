import { Game } from './js/Game.js';

/**
 * Demo script showing DRL AI capabilities (mock version for demonstration)
 */

console.log('=== Briscola DRL AI Demo ===\n');

async function runDemo() {
    console.log('1. Testing Rule-based AI...');
    
    // Test rule-based AI
    const game1 = new Game();
    game1.setAIType('rule-based');
    game1.init();
    game1.singlePlayer = true;
    
    console.log(`   - AI Type: ${game1.aiType}`);
    console.log(`   - DRL Agent: ${game1.drlAgent ? 'Initialized' : 'Not initialized'}`);
    
    // Simulate a few moves
    let moveCount = 0;
    while (!game1.isGameOver() && moveCount < 6) {
        const currentPlayer = game1.currentPlayerToActByIndex;
        const hand = game1.players[currentPlayer].hand;
        
        if (hand.cards.length > 0) {
            const card = game1.computerMove();
            if (card) {
                console.log(`   - Move ${moveCount + 1}: Player ${currentPlayer} played ${card.rank}${card.suit}`);
                moveCount++;
                
                // Handle round completion
                if (game1.isRoundOver()) {
                    const winner = game1.getWinningPlayer();
                    winner.pile.addCards(game1.middlePile.cards);
                    game1.middlePile.reset();
                    game1.autoSetNextToAct();
                    
                    if (!game1.isDeckEmpty() && !game1.isLastDeal()) {
                        game1.dealNextCardToAllPlayers();
                    }
                }
            }
        } else {
            break;
        }
    }
    
    console.log('\n2. Testing DRL AI...');
    
    // Test DRL AI (will fall back to rule-based in this environment)
    const game2 = new Game();
    game2.setAIType('drl');
    game2.init();
    game2.singlePlayer = true;
    
    console.log(`   - AI Type: ${game2.aiType}`);
    console.log(`   - DRL Agent: ${game2.drlAgent ? 'Initialized' : 'Not initialized (fallback to rule-based)'}`);
    
    // Simulate a few moves
    moveCount = 0;
    while (!game2.isGameOver() && moveCount < 6) {
        const currentPlayer = game2.currentPlayerToActByIndex;
        const hand = game2.players[currentPlayer].hand;
        
        if (hand.cards.length > 0) {
            const card = game2.computerMove();
            if (card) {
                console.log(`   - Move ${moveCount + 1}: Player ${currentPlayer} played ${card.rank}${card.suit}`);
                moveCount++;
                
                // Handle round completion
                if (game2.isRoundOver()) {
                    const winner = game2.getWinningPlayer();
                    winner.pile.addCards(game2.middlePile.cards);
                    game2.middlePile.reset();
                    game2.autoSetNextToAct();
                    
                    if (!game2.isDeckEmpty() && !game2.isLastDeal()) {
                        game2.dealNextCardToAllPlayers();
                    }
                }
            }
        } else {
            break;
        }
    }
    
    console.log('\n3. AI Architecture Summary:');
    console.log('   - GameStateEncoder: Converts game state to 93-dimensional vector');
    console.log('   - DRLAgent: Deep Q-Network with 3 hidden layers (128 neurons each)');
    console.log('   - TrainingEnvironment: Self-play training with experience replay');
    console.log('   - Game Integration: Seamless fallback between AI types');
    
    console.log('\n4. Features Implemented:');
    console.log('   ✓ Neural network architecture with TensorFlow.js');
    console.log('   ✓ Game state encoding for ML input');
    console.log('   ✓ Experience replay and target networks');
    console.log('   ✓ Self-play training environment');
    console.log('   ✓ Browser-based AI configuration UI');
    console.log('   ✓ Backward compatibility with rule-based AI');
    console.log('   ✓ Configurable training parameters');
    console.log('   ✓ Model saving/loading capabilities');
    
    console.log('\n5. Training Process (when TensorFlow.js is available):');
    console.log('   - Initialize DRL agent with random weights');
    console.log('   - Run self-play episodes with epsilon-greedy exploration');
    console.log('   - Store experiences in replay buffer');
    console.log('   - Train neural network on batches of experiences');
    console.log('   - Update target network periodically');
    console.log('   - Evaluate performance against rule-based AI');
    console.log('   - Save trained model for deployment');
    
    console.log('\n=== Demo Complete ===');
    
    console.log('\nTo use DRL AI in a full environment:');
    console.log('1. Ensure TensorFlow.js is loaded');
    console.log('2. Run training: node briscola/train-drl.js');
    console.log('3. Set AI type: game.setAIType("drl")');
    console.log('4. The AI will use trained neural network for decisions');
}

runDemo().catch(console.error);