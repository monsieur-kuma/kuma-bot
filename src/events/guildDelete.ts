import { Client, Guild } from 'discord.js';
import { Settings } from 'models';

// Emitted whenever a guild kicks the client or the guild is deleted/left.
export const handler = async (client: Client, guild: Guild) => {
  if (!guild.available) return;

  Logger.info(`${guild.id} removed the bot.`);

  const exists = await Settings.findOne({ where: { guildId: guild.id } });
  if (exists) {
    await exists.destroy();
  }
};
