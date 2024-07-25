import { Client, Guild } from 'discord.js';
import { Settings } from 'models';

// Emitted whenever the client joins a guild.
export const handler = async (client: Client, guild: Guild) => {
  Logger.info(`${guild.id} added the bot. Owner: ${guild.ownerId}`);

  const settings = await Settings.findOne({ where: { guildId: guild.id } });
  if (!settings) {
    await Settings.create({
      guildId: guild.id,
    });
  }
};
