import { TextChannel } from 'discord.js';
import type { Command } from 'types';

export const run: Command['run'] = async (client, message) => {
  if (!message.guild) {
    return;
  }

  // We'll partition the slash commands based on the guildOnly boolean.
  // Separating them into the correct objects defined in the array below.
  const [globalCmds, guildCmds] = Container.slashcmds.partition((c) => !c.conf.guildOnly);

  // Give the user a notification the commands are deploying.
  await (message.channel as TextChannel).send('Deploying commands!');

  // We'll use set but please keep in mind that `set` is overkill for a singular command.
  // Set the guild commands like
  await client.guilds.cache.get(message.guild.id)?.commands.set(guildCmds.map((c) => c.data));

  // Then set the global commands like
  await client.application?.commands
    .set(globalCmds.map((c) => c.data))
    .catch((e) => Logger.error(e));

  await (message.channel as TextChannel).send('All commands deployed!');
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'Bot Owner',
};

export const help: Command['help'] = {
  name: 'deploy',
  category: 'System',
  description: 'This will deploy all slash commands',
  usage: 'deploy',
};
