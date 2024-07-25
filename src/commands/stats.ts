import { codeBlock, TextChannel, version } from 'discord.js';
import moment from 'moment';
import type { Command } from 'types';

export const run: Command['run'] = async (client, message) => {
  const duration = moment.duration(client.uptime);
  const stats = codeBlock(
    'asciidoc',
    `= STATISTICS =
  • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
  • Uptime     :: ${duration.humanize()}
  • Users      :: ${client.guilds.cache
    .map((g) => g.memberCount)
    .reduce((a, b) => a + b)
    .toLocaleString()}
  • Servers    :: ${client.guilds.cache.size.toLocaleString()}
  • Channels   :: ${client.channels.cache.size.toLocaleString()}
  • Discord.js :: v${version}
  • Node       :: ${process.version}`
  );
  (message.channel as TextChannel).send(stats);
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Admin',
};

export const help: Command['help'] = {
  name: 'stats',
  category: 'Miscellaneous',
  description: 'Gives some useful bot statistics',
  usage: 'stats',
};
