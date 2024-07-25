import { DEFAULT_SETTINGS } from 'configs';
import { PERM_LEVELS, permLevel } from 'configs/permissions';
import { Client, Message, TextChannel } from 'discord.js';
import { Settings } from 'models';

// Emitted whenever a message is created.
export const handler = async (client: Client, message: Message) => {
  // It's good practice to ignore other bots.
  // This also makes your bot ignore itself and not get into a spam loop (we call that "botception").
  if (!client.user || message.author.bot) return;

  // Checks if the bot was mentioned via regex, with no message after it,
  // returns the prefix. The reason why we used regex here instead of
  // message.mentions is because of the mention prefix later on in the code, would render it useless.
  if (message.content.match(new RegExp(`^<@!?${client.user.id}> ?$`))) {
    message.reply(`My prefix on this guild is \`${process.env.CMD_PREFIX}\``);
    return;
  }

  // It's also good practice to ignore any and all messages that do not start with our prefix,
  // or a bot mention.
  const prefix = new RegExp(`^<@!?${client.user.id}> \\${process.env.CMD_PREFIX}`).exec(
    message.content
  );
  // This will return and stop the code from continuing if it's missing
  // our prefix (be it mention or from the settings).
  if (!prefix) return;

  // Separate "command" name, and "arguments" for the command.
  const args = message.content.slice(prefix[0].length).trim().split(/ +/g) ?? [];
  const command = args.shift()!.toLowerCase() ?? '';

  // If the member on a guild is invisible or not cached, fetch them.
  if (message.guild && !message.member) await message.guild.members.fetch(message.author);

  // Get the user or member's permission level from the elevation
  const level = await permLevel(message);

  // Check whether the command, or alias, exist in the collections defined in index.js.
  const cmd =
    Container.commands.get(command) || Container.commands.get(Container.aliases.get(command) ?? '');
  if (!cmd) return;

  // Some commands may not be useable in DMs. This check prevents those commands from running
  // and return a friendly error message.
  if (cmd && !message.guild && cmd.conf.guildOnly) {
    (message.channel as TextChannel).send(
      'This command is unavailable via private message. Please run this command in a guild.'
    );
    return;
  }

  if (!cmd.conf.enabled) return;

  const settings = await Settings.findOne({ where: { guildId: message.guildId } });
  if (level < LevelCache[cmd.conf.permLevel]) {
    if (settings ? settings.systemNotice : DEFAULT_SETTINGS.systemNotice) {
      (message.channel as TextChannel).send(`You do not have permission to use this command.
   Your permission level is ${level} (${PERM_LEVELS.find((l) => l.level === level)?.name})
   This command requires level ${LevelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
      return;
    }
    return;
  }

  const flags: string[] = [];
  while (args[0] && args[0][0] === '-') {
    const tmp = args.shift();
    if (tmp) {
      flags.push(tmp.slice(1));
    }
  }
  // If the command exists, **AND** the user has permission, run it.
  try {
    await cmd.run(client, message, args, level, { settings, flags });
    Logger.debug(
      `${PERM_LEVELS.find((l) => l.level === level)?.name} ${message.author.id} ran command ${
        cmd.help.name
      }`
    );
  } catch ({ message: err }: any) {
    Logger.debug(err);
    (message.channel as TextChannel)
      .send({ content: `There was a problem with your request.\n\`\`\`${err}\`\`\`` })
      .catch((e) => Logger.error('An error occurred replying on an error', e));
  }
};
