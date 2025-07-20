import { DRLAgent } from '../js/ai/DRLAgent.js';
import { TrainingEnvironment } from '../js/ai/TrainingEnvironment.js';

/**
 * Training script for DRL agent
 */
async function trainDRLAgent() {
    console.log('Starting DRL Agent Training...');
    
    // Create agent with training configuration
    const agent = new DRLAgent({
        epsilon: 0.9,           // High exploration during training
        epsilonDecay: 0.995,
        epsilonMin: 0.01,
        learningRate: 0.001,
        gamma: 0.95,
        batchSize: 32,
        memorySize: 10000,
        updateTargetFreq: 100,
        isTraining: true
    });
    
    // Create training environment
    const environment = new TrainingEnvironment({
        episodes: 1000,
        maxStepsPerEpisode: 50,
        rewards: {
            win: 10,
            lose: -10,
            draw: 0,
            cardWin: 1,
            cardLose: -1,
            invalidMove: -5
        }
    });
    
    // Progress callback
    const progressCallback = (progress) => {
        console.log(`Episode ${progress.episode}: Win Rate=${(progress.winRate * 100).toFixed(1)}%, Avg Reward=${progress.averageReward.toFixed(2)}, Epsilon=${progress.epsilon.toFixed(3)}`);
    };
    
    try {
        // Run training
        const stats = await environment.train(agent, progressCallback);
        
        console.log('\nTraining completed!');
        console.log('Final Statistics:', stats);
        
        // Evaluate against rule-based AI
        console.log('\nEvaluating against rule-based AI...');
        const evaluation = await environment.evaluate(agent, 100);
        console.log('Evaluation Results:', evaluation);
        
        // Save the trained model
        console.log('\nSaving trained model...');
        await agent.saveModel('file://./models/drl-agent');
        console.log('Model saved successfully!');
        
        // Cleanup
        agent.dispose();
        
    } catch (error) {
        console.error('Training failed:', error);
        agent.dispose();
    }
}

// Run training if this script is executed directly
if (typeof process !== 'undefined' && process.argv) {
    trainDRLAgent().catch(console.error);
}

export { trainDRLAgent };