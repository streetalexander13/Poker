const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for games
const games = {};

// Helper function to clean up old games (optional - runs every hour)
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  Object.keys(games).forEach(code => {
    if (games[code].lastActivity < oneHourAgo) {
      delete games[code];
      console.log(`Cleaned up game: ${code}`);
    }
  });
}, 60 * 60 * 1000);

// Create a new game
app.post('/api/games', (req, res) => {
  const { code, player, startingChips } = req.body;
  
  if (games[code]) {
    return res.status(400).json({ error: 'Game code already exists' });
  }

  // Initialize player with betting fields
  player.currentBet = 0;
  player.folded = false;

  games[code] = {
    code,
    players: [player],
    startingChips,
    started: false,
    pot: 0,
    currentRound: 'Pre-Flop',
    dealerIndex: 0,
    smallBlind: 10,
    bigBlind: 20,
    highestBet: 0,
    lastActivity: Date.now()
  };

  console.log(`Game created: ${code} by ${player.name}`);
  res.json(games[code]);
});

// Join a game
app.post('/api/games/:code/join', (req, res) => {
  const { code } = req.params;
  const { player } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Check if player already exists
  const existingPlayer = games[code].players.find(p => p.name === player.name);
  
  if (!existingPlayer) {
    // Initialize player with betting fields
    player.currentBet = 0;
    player.folded = false;
    games[code].players.push(player);
    console.log(`${player.name} joined game: ${code}`);
  } else {
    console.log(`${player.name} rejoined game: ${code}`);
  }

  games[code].lastActivity = Date.now();
  res.json(games[code]);
});

// Get game state
app.get('/api/games/:code', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Ensure all required fields exist (for backwards compatibility)
  if (games[code].pot === undefined) {
    games[code].pot = 0;
  }
  if (games[code].currentRound === undefined) {
    games[code].currentRound = 'Pre-Flop';
  }
  if (games[code].dealerIndex === undefined) {
    games[code].dealerIndex = 0;
  }
  if (games[code].smallBlind === undefined) {
    games[code].smallBlind = 10;
  }
  if (games[code].bigBlind === undefined) {
    games[code].bigBlind = 20;
  }
  if (games[code].highestBet === undefined) {
    games[code].highestBet = 0;
  }
  // Ensure all players have betting fields
  games[code].players.forEach(player => {
    if (player.currentBet === undefined) {
      player.currentBet = 0;
    }
    if (player.folded === undefined) {
      player.folded = false;
    }
  });

  games[code].lastActivity = Date.now();
  res.json(games[code]);
});

// Start game
app.post('/api/games/:code/start', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].started = true;
  games[code].lastActivity = Date.now();
  console.log(`Game started: ${code}`);
  res.json(games[code]);
});

// Update player chips
app.put('/api/games/:code/players/:playerId', (req, res) => {
  const { code, playerId } = req.params;
  const { chips } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const player = games[code].players.find(p => p.id === playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  player.chips = chips;
  games[code].lastActivity = Date.now();
  console.log(`${player.name} chips updated to ${chips} in game: ${code}`);
  res.json(games[code]);
});

// Update pot
app.put('/api/games/:code/pot', (req, res) => {
  const { code } = req.params;
  const { amount } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].pot = Math.max(0, amount);
  games[code].lastActivity = Date.now();
  console.log(`Pot updated to ${amount} in game: ${code}`);
  res.json(games[code]);
});

// Add to pot
app.post('/api/games/:code/pot/add', (req, res) => {
  const { code } = req.params;
  const { amount } = req.body;

  console.log(`Received add-to-pot request: code=${code}, amount=${amount}`);

  if (!games[code]) {
    console.error(`Game ${code} not found`);
    return res.status(404).json({ error: 'Game not found' });
  }

  // Ensure pot exists (for old games that might not have it)
  if (games[code].pot === undefined) {
    console.log(`Initializing pot for game ${code}`);
    games[code].pot = 0;
  }

  games[code].pot += amount;
  games[code].lastActivity = Date.now();
  console.log(`✅ Added ${amount} to pot (now ${games[code].pot}) in game: ${code}`);
  res.json(games[code]);
});

// Reset pot (e.g., after someone wins)
app.post('/api/games/:code/pot/reset', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].pot = 0;
  games[code].lastActivity = Date.now();
  console.log(`Pot reset in game: ${code}`);
  res.json(games[code]);
});

// Update round
app.put('/api/games/:code/round', (req, res) => {
  const { code } = req.params;
  const { round } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].currentRound = round;
  games[code].lastActivity = Date.now();
  console.log(`Round changed to ${round} in game: ${code}`);
  res.json(games[code]);
});

// Next dealer (rotate dealer button)
app.post('/api/games/:code/next-dealer', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].dealerIndex = (games[code].dealerIndex + 1) % games[code].players.length;
  games[code].lastActivity = Date.now();
  console.log(`Dealer moved to position ${games[code].dealerIndex} in game: ${code}`);
  res.json(games[code]);
});

// Post blinds
app.post('/api/games/:code/post-blinds', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const game = games[code];
  const playerCount = game.players.length;
  
  if (playerCount < 2) {
    return res.status(400).json({ error: 'Need at least 2 players' });
  }

  // Small blind is left of dealer
  const sbIndex = (game.dealerIndex + 1) % playerCount;
  // Big blind is left of small blind
  const bbIndex = (game.dealerIndex + 2) % playerCount;

  // Deduct blinds from players
  game.players[sbIndex].chips = Math.max(0, game.players[sbIndex].chips - game.smallBlind);
  game.players[bbIndex].chips = Math.max(0, game.players[bbIndex].chips - game.bigBlind);
  
  // Add to pot
  game.pot += game.smallBlind + game.bigBlind;
  
  game.lastActivity = Date.now();
  console.log(`Blinds posted: SB ${game.smallBlind}, BB ${game.bigBlind} in game: ${code}`);
  res.json(game);
});

// Place a bet
app.post('/api/games/:code/place-bet', (req, res) => {
  const { code } = req.params;
  const { playerId, amount } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const player = games[code].players.find(p => p.id === playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  if (amount > player.chips) {
    return res.status(400).json({ error: 'Not enough chips' });
  }

  // Initialize betting fields if they don't exist
  if (player.currentBet === undefined) player.currentBet = 0;
  if (player.folded === undefined) player.folded = false;
  if (games[code].highestBet === undefined) games[code].highestBet = 0;

  // Deduct chips from player
  player.chips -= amount;
  
  // Add to player's current bet
  player.currentBet += amount;
  
  // Add to pot
  games[code].pot += amount;
  
  // Update highest bet
  if (player.currentBet > games[code].highestBet) {
    games[code].highestBet = player.currentBet;
  }

  games[code].lastActivity = Date.now();
  console.log(`${player.name} bet ${amount} (total bet: ${player.currentBet}) in game: ${code}`);
  res.json(games[code]);
});

// Fold
app.post('/api/games/:code/fold', (req, res) => {
  const { code } = req.params;
  const { playerId } = req.body;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const player = games[code].players.find(p => p.id === playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // Initialize folded field if it doesn't exist
  if (player.folded === undefined) player.folded = false;

  player.folded = true;
  games[code].lastActivity = Date.now();
  console.log(`${player.name} folded in game: ${code}`);
  res.json(games[code]);
});

// Clear all bets (start new betting round)
app.post('/api/games/:code/clear-bets', (req, res) => {
  const { code } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Reset all players' bets and folded status
  games[code].players.forEach(player => {
    player.currentBet = 0;
    player.folded = false;
  });
  
  games[code].highestBet = 0;
  games[code].lastActivity = Date.now();
  console.log(`All bets cleared in game: ${code}`);
  res.json(games[code]);
});

// Leave game (remove player)
app.delete('/api/games/:code/players/:playerId', (req, res) => {
  const { code, playerId } = req.params;

  if (!games[code]) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[code].players = games[code].players.filter(p => p.id !== playerId);
  games[code].lastActivity = Date.now();

  // Delete game if no players left
  if (games[code].players.length === 0) {
    delete games[code];
    console.log(`Game deleted (no players): ${code}`);
  }

  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeGames: Object.keys(games).length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎰 Poker Chips Server running on http://localhost:${PORT}`);
  console.log(`📊 Active games: 0`);
});

