import { Client } from 'discord.js';

export const handler = (client: Client) => {
  Logger.info(`Ready! Logged in as ${client.user?.tag}`);
};
