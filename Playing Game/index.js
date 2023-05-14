const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Store active users and their groups
const activeUsers = {};

// Store game states
const gameStates = {};

// Serve static files in the "public" directory
app.use(express.static('public'));

// Handle incoming socket connections
io.on('connection', socket => {
  console.log(`User ${socket.id} connected`);

  // Handle user login (enter to game)
  socket.on('login', ({ username, group }) => {
    socket.username = username;
    socket.group = group;
    if (!activeUsers[group]) {
      activeUsers[group] = {};
    }
    if (!gameStates[group]) {
      gameStates[group] = {
        "started": false,
        "playerTurn": 0,
        "players": {}
      };
    }
    // Join group
    if (!gameStates[group].started) {
      activeUsers[group][username] = socket.id;
      console.log(`User ${socket.id} logged in as ${username} in group ${group}`);
      socket.join(group);
      io.to(group).emit('userLoggedIn', username);
    } else {
      //Reject connection if the game for the group already started
      socket.emit('errorMessage', 'Game already started! Join another group and start a new game.')
    }
  });

  // Handle starting a game
  socket.on('startGame', () => {
    const { group } = socket;
    const game = gameStates[group];
    if (game && !game.started) {
      game.started = true;
      const users = Object.keys(activeUsers[group])
      // for (var i=0; i<nUsers; i++) {
      for (var username of users) {
        game.players[username] = {
          "turn": false,
          "money": 750,
          "position": 0
        }
      }
      var randomPlayer = users[Math.floor(Math.random()*users.length)]
      game.players[randomPlayer].turn = true;
      game.board = [
        {'cost':50, 'owner': null},
        {'cost':65, 'owner': null},
        {'cost':100, 'owner': null},
        {'cost':75, 'owner': null},
        {'cost':85, 'owner': null},
        {'cost':150, 'owner': null},
        {'cost':120, 'owner': null},
        {'cost':220, 'owner': null}
      ]
      console.log(`Game in group ${group} has started!`);
      io.to(group).emit('gameStarted');
    }
  })

  // Handle rolling a dice
  socket.on('rollDice', () => {
    const { username, group } = socket;
    const game = gameStates[group];
    
    if (game && game.started && game.players[username].turn) {
      console.log("rolling dice");
      // Generate a random number between 1 and 6 to simulate rolling a dice
      const diceRoll = Math.floor(Math.random() * 6) + 1;
  
      // Update the player's position based on the dice roll
      console.log(game.players, username, game.players[username]);
      const currentPlayer = game.players[username];
      currentPlayer.position = (currentPlayer.position + diceRoll) % 10;
  
      console.log(`${username} rolled a ${diceRoll} in group ${group}!`);
      console.log(`New position for ${username} is ${currentPlayer.position}`);
  
      // Emit a message to the player who rolled the dice with the result
      socket.emit('diceRolled', diceRoll);
  
      // Emit a message to all players in the group to update their UI with the new position
      io.to(group).emit('playerMoved', username, currentPlayer.position);
    }
  });

  //TODO: return to Frontend status of the game. This will allow frontend know if user can roll dice or not

  // Handle incoming messages
  socket.on('message', ({ text }) => {
    const { username, group } = socket;
    const message = { username, text };
    console.log(`User ${socket.id} sent message: ${text}`);
    io.to(group).emit('message', message);
  });

  // Handle user logout
  socket.on('logout', () => {
    const { username, group } = socket;
    if (activeUsers[group]) {
      delete activeUsers[group][username];
      if (activeUsers[group] == {}) {
        delete activeUsers[group];
        delete gameStates[group];
      }
      console.log(`User ${socket.id} logged out from group ${group}`);
      io.to(group).emit('userLoggedOut', username);
    }
  });



});

// Start the server
server.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on port 3000');
});