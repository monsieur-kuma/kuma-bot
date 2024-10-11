require('dotenv-flow').config({
  node_env: 'development',
});

// Send Messages
// Use Slash Commands
const PERMISSIONS = 2147486720;

// bot
const SCPOPE = 'bot';

console.log(
  `https://discord.com/api/oauth2/authorize?client_id=${process.env.APP_ID}&permissions=${PERMISSIONS}&scope=${SCPOPE}`
);
