require('dotenv-flow').config({
  node_env: 'development',
});

// Read Messages/View Channels
// Send Messages
// Attach Files
// Mention Everyone
// Use Slash Commands
const PERMISSIONS = 2147650560;

// bot
const SCPOPE = 'bot';

console.log(
  `https://discord.com/api/oauth2/authorize?client_id=${process.env.APP_ID}&permissions=${PERMISSIONS}&scope=${SCPOPE}`
);
