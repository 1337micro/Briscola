# DRL AI Configuration

Configuration for the Deep Reinforcement Learning AI in Briscola.

## AI Types

### Rule-based AI (Default)
- Uses hand-coded heuristics
- Fast and predictable
- Good baseline performance

### DRL AI
- Uses Deep Q-Network (DQN)
- Learns through self-play
- Can adapt strategies

## Usage

### In Game
```javascript
// Set AI type before starting game
game.setAIType('drl'); // or 'rule-based'
game.init();
```

### Training
```bash
cd briscola
node train-drl.js
```

## Model Architecture

- Input: 96 features (game state encoding)
- Hidden layers: 3 x 128 neurons (ReLU activation)
- Output: 3 neurons (Q-values for each card in hand)

## Training Configuration

- Episodes: 1000
- Batch size: 32
- Learning rate: 0.001
- Gamma (discount): 0.95
- Epsilon decay: 0.995
- Memory size: 10000

## File Structure

```
js/ai/
  ├── GameStateEncoder.js  # Converts game state to neural input
  ├── DRLAgent.js          # Main DRL agent with DQN
  └── TrainingEnvironment.js # Self-play training infrastructure

models/
  └── drl-agent/           # Trained model weights (created after training)
```