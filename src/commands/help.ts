import { codeBlock, TextChannel } from 'discord.js';
import _ from 'lodash';
import type { Command } from 'types';

export const run: Command['run'] = async (client, message, args, level) => {
  if (!args.length) {
    const myCommands = message.guild
      ? Container.commands.filter((cmd) => LevelCache[cmd.conf.permLevel] <= level)
      : Container.commands.filter(
          (cmd) => LevelCache[cmd.conf.permLevel] <= level && !cmd.conf.guildOnly
        );

    const enabledCommands = myCommands.filter((cmd) => cmd.conf.enabled);

    const commandNames = [...enabledCommands.keys()];

    // This make the help commands "aligned" in the output.
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    let currentCategory = '';
    let output = `= Command List =\n[Use ${process.env.CMD_PREFIX}help <commandname> for details]\n`;
    const sorted = enabledCommands.sort((p, c) => {
      if (p.help.category > c.help.category) {
        return 1;
      }
      if (p.help.name > c.help.name && p.help.category === c.help.category) {
        return 1;
      }
      return -1;
    });

    sorted.forEach((c) => {
      const cat = _.startCase(c.help.category);
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${process.env.CMD_PREFIX}${c.help.name}${' '.repeat(
        longest - c.help.name.length
      )} :: ${c.help.description}\n`;
    });
    (message.channel as TextChannel).send(codeBlock('asciidoc', output));
  } else {
    const command =
      Container.commands.get(args[0]) ??
      Container.commands.get(Container.aliases.get(args[0]) ?? '');
    if (command) {
      if (level < LevelCache[command.conf.permLevel]) return;
      (message.channel as TextChannel).send(
        codeBlock(
          'asciidoc',
          `= ${command.help.name} = \n${command.help.description}\nusage:: ${
            command.help.usage
          }\naliases:: ${command.conf.aliases.join(', ')}`
        )
      );
    } else {
      (message.channel as TextChannel).send('No command with that name, or alias exists.');
    }
  }
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: false,
  aliases: ['h', 'help'],
  permLevel: 'User',
};

export const help: Command['help'] = {
  name: 'help',
  category: 'System',
  description: 'Displays all the available commands for your permission level.',
  usage: 'help [command]',
};
