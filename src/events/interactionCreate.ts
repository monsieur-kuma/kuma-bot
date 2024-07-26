import { DEFAULT_SETTINGS } from 'configs';
import { PERM_LEVELS, permLevel } from 'configs/permissions';
import { BaseInteraction, Client } from 'discord.js';
import { Settings } from 'models';

// Emitted when an interaction is created.
export const handler = async (client: Client, interaction: BaseInteraction) => {
  // If it's not a command, stop.
  if (!interaction.isCommand()) {
    return;
  }

  // Grab the command data from the client.container.slashcmds Collection
  const cmd = Container.slashcmds.get(interaction.commandName);
  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  const settings = await Settings.findOne({ where: { guildId: interaction.guildId } });

  // Get the user or member's permission level from the elevation
  const level = await permLevel(interaction);
  // Since the permission system from Discord is rather limited in regarding to Slash Commands,
  // we'll just utilise our permission checker.
  if (level < LevelCache[cmd.conf.permLevel]) {
    // Due to the nature of interactions we **must** respond to them otherwise
    // they will error out because we didn't respond to them.
    await interaction.reply({
      content: `This command can only be used by ${cmd.conf.permLevel}`,
      ephemeral: !(settings ? settings.systemNotice : DEFAULT_SETTINGS.systemNotice),
    });
    return;
  }

  // If everything checks out, run the command
  try {
    await cmd.run(client, interaction, { settings });
    Logger.debug(
      `${PERM_LEVELS.find((l) => l.level === level)?.name} ${
        interaction.user.id
      } ran slash command ${interaction.commandName}`
    );
  } catch ({ message }: any) {
    Logger.error(message);
    if (interaction.replied) {
      interaction
        .followUp({
          content: `There was a problem with your request.\n\`\`\`${message}\`\`\``,
          ephemeral: true,
        })
        .catch((e) => Logger.error('An error occurred following up on an error', e));
    } else if (interaction.deferred) {
      interaction
        .editReply({
          content: `There was a problem with your request.\n\`\`\`${message}\`\`\``,
        })
        .catch((e) => Logger.error('An error occurred following up on an error', e));
    } else {
      interaction
        .reply({
          content: `There was a problem with your request.\n\`\`\`${message}\`\`\``,
          ephemeral: true,
        })
        .catch((e) => Logger.error('An error occurred replying on an error', e));
    }
  }
};
