import * as tf from '@tensorflow/tfjs';
import { GameStateEncoder } from './GameStateEncoder.js';

/**
 * Deep Q-Network agent for Briscola
 */
class DRLAgent {
    constructor(config = {}) {
        this.encoder = new GameStateEncoder();
        this.model = null;
        this.targetModel = null;
        
        // Hyperparameters
        this.epsilon = config.epsilon || 0.1; // Exploration rate
        this.epsilonDecay = config.epsilonDecay || 0.995;
        this.epsilonMin = config.epsilonMin || 0.01;
        this.learningRate = config.learningRate || 0.001;
        this.gamma = config.gamma || 0.95; // Discount factor
        this.batchSize = config.batchSize || 32;
        this.updateTargetFreq = config.updateTargetFreq || 100;
        
        // Experience replay
        this.memory = [];
        this.memorySize = config.memorySize || 10000;
        
        // Training state
        this.trainingStep = 0;
        this.isTraining = config.isTraining || false;
        
        this.initializeModel();
    }
    
    /**
     * Initialize the neural network model
     */
    initializeModel() {
        const inputSize = this.encoder.FEATURE_SIZE;
        const hiddenSize = 128;
        const outputSize = 3; // Max 3 cards in hand
        
        // Main Q-network
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [inputSize],
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: outputSize,
                    activation: 'linear',
                    kernelInitializer: 'glorotUniform'
                })
            ]
        });
        
        this.model.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: 'meanSquaredError'
        });
        
        // Target network (copy of main network)
        this.updateTargetModel();
    }
    
    /**
     * Update target network with current model weights
     */
    updateTargetModel() {
        if (this.targetModel) {
            this.targetModel.dispose();
        }
        
        // Create a simple copy by recreating the same architecture
        const inputSize = this.encoder.FEATURE_SIZE;
        const hiddenSize = 128;
        const outputSize = 3;
        
        this.targetModel = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [inputSize],
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: hiddenSize,
                    activation: 'relu',
                    kernelInitializer: 'glorotUniform'
                }),
                tf.layers.dense({
                    units: outputSize,
                    activation: 'linear',
                    kernelInitializer: 'glorotUniform'
                })
            ]
        });
        
        // Copy weights from main model
        this.targetModel.setWeights(this.model.getWeights());
    }
    
    /**
     * Select action using epsilon-greedy policy
     * @param {Game} game - Current game state
     * @param {number} playerIndex - Player index (0 or 1)
     * @returns {Card} Selected card to play
     */
    selectAction(game, playerIndex) {
        const validActions = this.encoder.getValidActions(game, playerIndex);
        
        if (validActions.length === 0) {
            throw new Error('No valid actions available');
        }
        
        // Epsilon-greedy exploration
        if (this.isTraining && Math.random() < this.epsilon) {
            // Random action
            const randomIndex = Math.floor(Math.random() * validActions.length);
            return this.encoder.actionToCard(game, playerIndex, validActions[randomIndex]);
        }
        
        // Greedy action using Q-values
        const state = this.encoder.encodeGameState(game, playerIndex);
        const qValues = this.predictQValues(state);
        
        // Mask invalid actions with very negative values
        const maskedQValues = qValues.slice();
        for (let i = 0; i < maskedQValues.length; i++) {
            if (!validActions.includes(i)) {
                maskedQValues[i] = -Infinity;
            }
        }
        
        // Select action with highest Q-value
        const bestAction = maskedQValues.indexOf(Math.max(...maskedQValues));
        return this.encoder.actionToCard(game, playerIndex, bestAction);
    }
    
    /**
     * Predict Q-values for a given state
     * @param {Array} state - Encoded game state
     * @returns {Array} Q-values for each action
     */
    predictQValues(state) {
        return tf.tidy(() => {
            const stateTensor = tf.tensor2d([state]);
            const prediction = this.model.predict(stateTensor);
            return Array.from(prediction.dataSync());
        });
    }
    
    /**
     * Store experience in replay buffer
     * @param {Array} state - Current state
     * @param {number} action - Action taken
     * @param {number} reward - Reward received
     * @param {Array} nextState - Next state
     * @param {boolean} done - Whether episode is done
     */
    remember(state, action, reward, nextState, done) {
        if (!this.isTraining) return;
        
        this.memory.push({
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        });
        
        // Remove old experiences if memory is full
        if (this.memory.length > this.memorySize) {
            this.memory.shift();
        }
    }
    
    /**
     * Train the model on a batch of experiences
     */
    async replay() {
        if (!this.isTraining || this.memory.length < this.batchSize) {
            return;
        }
        
        // Sample random batch
        const batch = [];
        for (let i = 0; i < this.batchSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.memory.length);
            batch.push(this.memory[randomIndex]);
        }
        
        // Prepare training data
        const states = batch.map(exp => exp.state);
        const nextStates = batch.map(exp => exp.nextState);
        
        return tf.tidy(() => {
            const statesTensor = tf.tensor2d(states);
            const nextStatesTensor = tf.tensor2d(nextStates);
            
            // Current Q-values
            const currentQValues = this.model.predict(statesTensor);
            
            // Next Q-values from target network
            const nextQValues = this.targetModel.predict(nextStatesTensor);
            
            // Calculate target Q-values
            const targetQValues = currentQValues.clone();
            
            for (let i = 0; i < batch.length; i++) {
                const exp = batch[i];
                const targetQ = exp.done ? 
                    exp.reward : 
                    exp.reward + this.gamma * Math.max(...Array.from(nextQValues.slice([i, 0], [1, -1]).dataSync()));
                
                // Update Q-value for the action taken
                const currentQ = Array.from(targetQValues.slice([i, 0], [1, -1]).dataSync());
                currentQ[exp.action] = targetQ;
                
                // Update tensor
                const updatedRow = tf.tensor1d(currentQ);
                const indices = tf.tensor1d([i], 'int32');
                targetQValues.scatter(indices, updatedRow.expandDims(0));
            }
            
            // Train the model
            return this.model.trainOnBatch(statesTensor, targetQValues);
        });
    }
    
    /**
     * Update training parameters
     */
    updateTrainingParams() {
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
        
        this.trainingStep++;
        
        // Update target network periodically
        if (this.trainingStep % this.updateTargetFreq === 0) {
            this.updateTargetModel();
        }
    }
    
    /**
     * Save model weights
     * @param {string} path - Path to save model
     */
    async saveModel(path) {
        return await this.model.save(path);
    }
    
    /**
     * Load model weights
     * @param {string} path - Path to load model from
     */
    async loadModel(path) {
        this.model = await tf.loadLayersModel(path);
        this.updateTargetModel();
    }
    
    /**
     * Set training mode
     * @param {boolean} training - Whether to enable training
     */
    setTraining(training) {
        this.isTraining = training;
    }
    
    /**
     * Get model summary
     */
    getModelSummary() {
        return this.model.summary();
    }
    
    /**
     * Dispose of models to free memory
     */
    dispose() {
        if (this.model) {
            this.model.dispose();
        }
        if (this.targetModel) {
            this.targetModel.dispose();
        }
    }
}

export { DRLAgent };