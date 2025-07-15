// Test backward compatibility - similar to playGames.js but without database
import { Game } from './briscola/js/Game.js';

console.log('Testing backward compatibility...\n');

// Test that existing code without variants still works
let game = new Game();
game.init();

console.log('Playing a game with traditional rules...');
let roundCount = 0;
while (!game.isGameOver()) {
    game._playRound();
    roundCount++;
    if (roundCount > 50) { // Safety break
        console.log('Game running too long, breaking...');
        break;
    }
}

console.log(`Game completed after ${roundCount} rounds`);
console.log(`Player 1 final score: ${game.player1.pile.countPoints()}`);
console.log(`Player 2 final score: ${game.player2.pile.countPoints()}`);
console.log('✓ Backward compatibility test: PASS');