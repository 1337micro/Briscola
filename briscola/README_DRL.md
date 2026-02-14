# Briscola DRL AI Implementation

This implementation adds Deep Reinforcement Learning capabilities to the Briscola card game using TensorFlow.js.

## Features Implemented

### ✅ Core DRL Infrastructure
- **DRLAgent.js**: Deep Q-Network implementation with experience replay
- **GameStateEncoder.js**: Converts game state to 93-dimensional numerical vectors  
- **TrainingEnvironment.js**: Self-play training with configurable parameters
- **AI Configuration UI**: Browser-based interface to switch between AI types

### ✅ Neural Network Architecture
- Input: 93 features (hand cards, middle pile, trump card, scores, turn info)
- Hidden layers: 3 × 128 neurons with ReLU activation
- Output: 3 Q-values (for each card in hand)
- Target network for stable training

### ✅ Game Integration
- Modified `Game.js` to support both rule-based and DRL AI
- Seamless fallback from DRL to rule-based AI when TensorFlow.js unavailable
- Backward compatibility maintained with existing game mechanics
- Configurable AI type selection

### ✅ Training Infrastructure
- Self-play episodes with epsilon-greedy exploration
- Experience replay buffer (10,000 experiences)
- Reward shaping for card wins/losses and game outcomes
- Model saving/loading capabilities
- Training progress monitoring

## Files Created/Modified

```
briscola/
├── js/
│   ├── Game.js                 # Modified: Added DRL AI integration
│   ├── ai/
│   │   ├── DRLAgent.js         # New: Main DRL agent
│   │   ├── GameStateEncoder.js # New: State encoding
│   │   └── TrainingEnvironment.js # New: Training infrastructure
│   └── ai-config.js            # New: Browser AI configuration
├── game.html                   # Modified: Added TensorFlow.js
├── train-drl.js               # New: Training script
├── demo-drl.js                # New: Demo script
└── AI_CONFIG.md               # New: Configuration docs
```

## Usage

### Browser Usage
1. Open `game.html` in browser
2. Use the AI Configuration panel (top-right) to switch between:
   - Rule-based AI (default)
   - DRL AI (Neural Network)

### Training (Node.js)
```bash
cd briscola
node train-drl.js  # Train the DRL agent
```

### Programmatic Usage
```javascript
// Set AI type
game.setAIType('drl');  // or 'rule-based'
game.init();

// Check AI status
console.log(game.aiType);
console.log(game.drlAgent !== null);
```

## Technical Details

### State Representation
Each game state is encoded as a 93-dimensional vector:
- Hand cards: 3 × 15 features (rank one-hot + suit one-hot + points)
- Middle pile: 2 × 15 features  
- Trump card: 1 × 15 features
- Scores: 2 features (player + opponent, normalized)
- Turn info: 1 feature (current player indicator)

### Training Configuration
- Learning rate: 0.001
- Discount factor (γ): 0.95
- Epsilon decay: 0.995 (exploration → exploitation)
- Batch size: 32
- Target network update frequency: 100 steps

### Reward Structure
- Game win: +10
- Game loss: -10
- Round win: +1 (+ bonus for valuable cards)
- Round loss: -1 (- penalty for valuable cards)
- Invalid move: -5

## Browser Compatibility

The implementation uses TensorFlow.js for browser compatibility:
- Works in modern browsers with JavaScript modules
- Falls back gracefully when TensorFlow.js unavailable
- No server-side dependencies for inference

## Future Enhancements

- [ ] Pre-trained model weights
- [ ] Advanced neural architectures (attention, LSTM)
- [ ] Multi-agent training scenarios
- [ ] Performance benchmarking
- [ ] Training visualization dashboard

## Screenshots

![AI Configuration UI](https://github.com/user-attachments/assets/5609a459-9271-42d2-b2f7-1645329b9d6c)

*The AI Configuration panel allows switching between rule-based and DRL AI in real-time.*