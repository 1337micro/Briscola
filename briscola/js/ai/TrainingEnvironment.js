import { Game } from '../Game.js';
import { DRLAgent } from './DRLAgent.js';
import { GameStateEncoder } from './GameStateEncoder.js';

/**
 * Training environment for self-play DRL training
 */
class TrainingEnvironment {
    constructor(config = {}) {
        this.encoder = new GameStateEncoder();
        
        // Training parameters
        this.episodes = config.episodes || 1000;
        this.maxStepsPerEpisode = config.maxStepsPerEpisode || 50;
        this.rewardConfig = config.rewards || {
            win: 10,
            lose: -10,
            draw: 0,
            cardWin: 1,
            cardLose: -1,
            invalidMove: -5
        };
        
        // Statistics
        this.stats = {
            episodes: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            averageReward: 0,
            totalReward: 0
        };
        
        this.trainingLog = [];
    }
    
    /**
     * Run self-play training
     * @param {DRLAgent} agent - The agent to train
     * @param {function} progressCallback - Optional callback for progress updates
     */
    async train(agent, progressCallback = null) {
        agent.setTraining(true);
        
        console.log(`Starting training for ${this.episodes} episodes...`);
        
        for (let episode = 0; episode < this.episodes; episode++) {
            const episodeReward = await this.runEpisode(agent);
            
            // Update statistics
            this.updateStats(episodeReward);
            
            // Train the agent
            await agent.replay();
            agent.updateTrainingParams();
            
            // Log progress
            if (episode % 100 === 0) {
                const progress = {
                    episode: episode,
                    epsilon: agent.epsilon,
                    averageReward: this.stats.averageReward,
                    winRate: this.stats.wins / (this.stats.episodes || 1)
                };
                
                this.trainingLog.push(progress);
                console.log(`Episode ${episode}: Avg Reward=${progress.averageReward.toFixed(2)}, Win Rate=${(progress.winRate * 100).toFixed(1)}%, Epsilon=${progress.epsilon.toFixed(3)}`);
                
                if (progressCallback) {
                    progressCallback(progress);
                }
            }
        }
        
        agent.setTraining(false);
        console.log('Training completed!');
        return this.stats;
    }
    
    /**
     * Run a single training episode
     * @param {DRLAgent} agent - The agent to train
     * @returns {number} Total reward for the episode
     */
    async runEpisode(agent) {
        const game = new Game();
        game.init();
        game.singlePlayer = true;
        
        let totalReward = 0;
        let step = 0;
        const maxSteps = this.maxStepsPerEpisode;
        
        // Episode data for experience replay
        const episodeData = [];
        
        while (!game.isGameOver() && step < maxSteps) {
            const currentPlayer = game.currentPlayerToActByIndex;
            
            // Get current state
            const state = this.encoder.encodeGameState(game, currentPlayer);
            
            // Agent selects action
            const selectedCard = agent.selectAction(game, currentPlayer);
            const actionIndex = game.players[currentPlayer].hand.cards.indexOf(selectedCard);
            
            // Execute action
            const beforePilePoints = game.players[currentPlayer].pile.countPoints();
            const beforeOpponentPoints = game.players[1 - currentPlayer].pile.countPoints();
            
            // Play the card
            try {
                game.addCardToHistory(selectedCard, currentPlayer);
                game.players[currentPlayer].hand.removeCard(selectedCard);
                game.middlePile.addCard(selectedCard);
                game.next();
                
                // Check if round is over
                let reward = 0;
                if (game.isRoundOver()) {
                    const winnerIndex = game.getWinningPlayerIndex();
                    const roundPoints = game.middlePile.cards.reduce((sum, card) => sum + (card.points || 0), 0);
                    
                    if (winnerIndex === currentPlayer) {
                        reward = this.rewardConfig.cardWin + (roundPoints * 0.1);
                    } else {
                        reward = this.rewardConfig.cardLose - (roundPoints * 0.1);
                    }
                    
                    // Process round end
                    const winner = game.getWinningPlayer();
                    winner.pile.addCards(game.middlePile.cards);
                    game.middlePile.reset();
                    game.autoSetNextToAct();
                    
                    if (!game.isDeckEmpty() && !game.isLastDeal()) {
                        game.dealNextCardToAllPlayers();
                    }
                }
                
                // Get next state
                const nextState = game.isGameOver() ? 
                    new Array(this.encoder.FEATURE_SIZE).fill(0) : 
                    this.encoder.encodeGameState(game, currentPlayer);
                
                // Store experience
                episodeData.push({
                    state: state,
                    action: actionIndex,
                    reward: reward,
                    nextState: nextState,
                    done: game.isGameOver()
                });
                
                totalReward += reward;
                
            } catch (error) {
                // Invalid move penalty
                const invalidReward = this.rewardConfig.invalidMove;
                episodeData.push({
                    state: state,
                    action: actionIndex,
                    reward: invalidReward,
                    nextState: state, // Same state since move was invalid
                    done: false
                });
                
                totalReward += invalidReward;
                console.warn('Invalid move penalty applied:', error.message);
            }
            
            step++;
        }
        
        // Add final game outcome reward
        if (game.isGameOver()) {
            const finalReward = this.calculateFinalReward(game);
            totalReward += finalReward;
            
            // Update last experience with final reward
            if (episodeData.length > 0) {
                episodeData[episodeData.length - 1].reward += finalReward;
                episodeData[episodeData.length - 1].done = true;
            }
        }
        
        // Store all experiences in agent's memory
        for (const experience of episodeData) {
            agent.remember(
                experience.state,
                experience.action,
                experience.reward,
                experience.nextState,
                experience.done
            );
        }
        
        return totalReward;
    }
    
    /**
     * Calculate final reward based on game outcome
     * @param {Game} game - Completed game
     * @returns {number} Final reward
     */
    calculateFinalReward(game) {
        const player1Points = game.player1.pile.countPoints();
        const player2Points = game.player2.pile.countPoints();
        
        if (player1Points > player2Points) {
            return this.rewardConfig.win;
        } else if (player1Points < player2Points) {
            return this.rewardConfig.lose;
        } else {
            return this.rewardConfig.draw;
        }
    }
    
    /**
     * Update training statistics
     * @param {number} episodeReward - Reward from the episode
     */
    updateStats(episodeReward) {
        this.stats.episodes++;
        this.stats.totalReward += episodeReward;
        this.stats.averageReward = this.stats.totalReward / this.stats.episodes;
        
        // Note: Win/lose tracking would need game outcome info
        // For now, we'll use reward as a proxy
        if (episodeReward > 5) {
            this.stats.wins++;
        } else if (episodeReward < -5) {
            this.stats.losses++;
        } else {
            this.stats.draws++;
        }
    }
    
    /**
     * Evaluate agent performance against rule-based AI
     * @param {DRLAgent} agent - The agent to evaluate
     * @param {number} games - Number of evaluation games
     * @returns {Object} Evaluation results
     */
    async evaluate(agent, games = 100) {
        agent.setTraining(false);
        
        let wins = 0;
        let losses = 0;
        let draws = 0;
        
        console.log(`Evaluating agent performance over ${games} games...`);
        
        for (let i = 0; i < games; i++) {
            const game = new Game();
            game.init();
            game.singlePlayer = true;
            
            // Play game with DRL agent vs rule-based AI
            while (!game.isGameOver()) {
                const currentPlayer = game.currentPlayerToActByIndex;
                let selectedCard;
                
                if (currentPlayer === 0) {
                    // DRL agent plays
                    selectedCard = agent.selectAction(game, currentPlayer);
                } else {
                    // Rule-based AI plays
                    selectedCard = game.computerAI(game.players[currentPlayer].hand);
                }
                
                // Execute move
                try {
                    game.addCardToHistory(selectedCard, currentPlayer);
                    game.players[currentPlayer].hand.removeCard(selectedCard);
                    game.middlePile.addCard(selectedCard);
                    game.next();
                    
                    if (game.isRoundOver()) {
                        const winner = game.getWinningPlayer();
                        winner.pile.addCards(game.middlePile.cards);
                        game.middlePile.reset();
                        game.autoSetNextToAct();
                        
                        if (!game.isDeckEmpty() && !game.isLastDeal()) {
                            game.dealNextCardToAllPlayers();
                        }
                    }
                } catch (error) {
                    console.warn('Move error during evaluation:', error.message);
                    break;
                }
            }
            
            // Determine winner
            const player1Points = game.player1.pile.countPoints();
            const player2Points = game.player2.pile.countPoints();
            
            if (player1Points > player2Points) {
                wins++;
            } else if (player1Points < player2Points) {
                losses++;
            } else {
                draws++;
            }
        }
        
        const results = {
            wins: wins,
            losses: losses,
            draws: draws,
            winRate: wins / games,
            totalGames: games
        };
        
        console.log(`Evaluation Results: ${wins}W/${losses}L/${draws}D (${(results.winRate * 100).toFixed(1)}% win rate)`);
        
        return results;
    }
    
    /**
     * Get training statistics
     * @returns {Object} Training statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Get training log
     * @returns {Array} Training log data
     */
    getTrainingLog() {
        return [...this.trainingLog];
    }
    
    /**
     * Reset training statistics
     */
    resetStats() {
        this.stats = {
            episodes: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            averageReward: 0,
            totalReward: 0
        };
        this.trainingLog = [];
    }
}

export { TrainingEnvironment };