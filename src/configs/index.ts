import { GatewayIntentBits, Partials } from 'discord.js';

/*
 * Intents the bot needs.
 * By default GuideBot needs Guilds, Guild Messages and Direct Messages to work.
 * For join messages to work you need Guild Members, which is privileged and requires extra setup.
 * For more info about intents see the README.
 */
export const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.MessageContent,
];

// Partials your bot may need should go here, CHANNEL is required for DM's
export const PARTIALS = [
  Partials.User,
  Partials.Channel,
  Partials.GuildMember,
  Partials.Message,
  Partials.GuildScheduledEvent,
];

/*
 * Default per-server settings. These settings are entered in a database on first load,
 * And are then completely ignored from this file. To modify default settings, use the `conf` command.
 * DO NOT REMOVE THIS BEFORE YOUR BOT IS LOADED AND FUNCTIONAL.
 */
export const DEFAULT_SETTINGS = {
  logChannel: 'bot-log',
  adminRole: 'admin',
  systemNotice: true, // This gives a notice when a user tries to run a command that they do not have permission to use.
  commandReply: true, // Toggle this if you want the bot to ping the command executor or not.
};
