import { Constants } from '../Constants.js';

/**
 * Encodes game state into numerical vectors for neural network input
 */
class GameStateEncoder {
    constructor() {
        // Number of cards per suit (1-10)
        this.CARDS_PER_SUIT = 10;
        // Number of suits
        this.NUM_SUITS = 4;
        // Total cards in deck
        this.TOTAL_CARDS = this.CARDS_PER_SUIT * this.NUM_SUITS;
        
        // State vector dimensions
        this.HAND_SIZE = 3;
        this.MIDDLE_PILE_SIZE = 2;
        this.FEATURE_SIZE = this.calculateFeatureSize();
    }
    
    calculateFeatureSize() {
        // Hand cards (3 * card encoding size)
        // Middle pile cards (2 * card encoding size) 
        // Trump card (1 * card encoding size)
        // Scores (2 values)
        // Turn info (1 value)
        // Card encoding: rank (10 bits) + suit (4 bits) + points (1 value) = 15 features per card
        const cardEncodingSize = 15;
        return (this.HAND_SIZE + this.MIDDLE_PILE_SIZE + 1) * cardEncodingSize + 3;
    }
    
    /**
     * Encode a card into a numerical vector
     * @param {Card} card - The card to encode (can be null)
     * @returns {Array} Encoded card vector
     */
    encodeCard(card) {
        const encoding = new Array(15).fill(0);
        
        if (!card) {
            return encoding; // All zeros for null card
        }
        
        // Encode rank (1-10 as one-hot)
        if (card.rank >= 1 && card.rank <= 10) {
            encoding[card.rank - 1] = 1;
        }
        
        // Encode suit (one-hot: Spade, Coppe, Denari, Bastoni)
        const suitMap = { 'Spade': 0, 'Coppe': 1, 'Denari': 2, 'Bastoni': 3 };
        const suitIndex = suitMap[card.suit];
        if (suitIndex !== undefined) {
            encoding[10 + suitIndex] = 1;
        }
        
        // Encode points (normalized)
        encoding[14] = (card.points || 0) / 11; // Max points is 11
        
        return encoding;
    }
    
    /**
     * Encode the complete game state
     * @param {Game} game - The game object
     * @param {number} playerIndex - Index of the player (0 or 1)
     * @returns {Array} Complete state vector
     */
    encodeGameState(game, playerIndex) {
        const state = [];
        
        // Encode player's hand (always 3 cards, pad with zeros if needed)
        const hand = game.players[playerIndex].hand.cards;
        for (let i = 0; i < this.HAND_SIZE; i++) {
            const card = hand[i] || null;
            state.push(...this.encodeCard(card));
        }
        
        // Encode middle pile (up to 2 cards)
        const middleCards = game.middlePile.cards;
        for (let i = 0; i < this.MIDDLE_PILE_SIZE; i++) {
            const card = middleCards[i] || null;
            state.push(...this.encodeCard(card));
        }
        
        // Encode trump card
        state.push(...this.encodeCard(game.trumpCard));
        
        // Encode scores (normalized by typical max score ~60)
        const player = game.players[playerIndex];
        const opponent = game.players[1 - playerIndex];
        state.push((player.pile.countPoints() || 0) / 60);
        state.push((opponent.pile.countPoints() || 0) / 60);
        
        // Encode turn information
        state.push(game.currentPlayerToActByIndex === playerIndex ? 1 : 0);
        
        return state;
    }
    
    /**
     * Get valid actions (card indices) for a player
     * @param {Game} game - The game object
     * @param {number} playerIndex - Index of the player
     * @returns {Array} Array of valid card indices
     */
    getValidActions(game, playerIndex) {
        const hand = game.players[playerIndex].hand.cards;
        return hand.map((_, index) => index);
    }
    
    /**
     * Convert action index to card
     * @param {Game} game - The game object
     * @param {number} playerIndex - Index of the player
     * @param {number} actionIndex - Index of the card in hand
     * @returns {Card} The selected card
     */
    actionToCard(game, playerIndex, actionIndex) {
        const hand = game.players[playerIndex].hand.cards;
        return hand[actionIndex];
    }
}

export { GameStateEncoder };