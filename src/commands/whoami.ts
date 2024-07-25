import { DEFAULT_SETTINGS } from 'configs';
import { readPermLevel } from 'configs/permissions';
import type { Command } from 'types';

export const run: Command['run'] = async (client, message, args, level, { settings }) => {
  if (!message.guild) return;

  const commandReply = settings ? settings.commandReply : DEFAULT_SETTINGS.commandReply;
  message.reply({
    content: `User ID: ${message.author.id}. Your permission level is: ${level} - ${readPermLevel(
      level
    )}`,
    allowedMentions: { repliedUser: commandReply },
  });
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

export const help: Command['help'] = {
  name: 'whoami',
  category: 'Miscellaneous',
  description: 'Tells you your user id and permission level for the current message location.',
  usage: 'whoami',
};
