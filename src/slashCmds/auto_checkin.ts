import { ChatInputCommandInteraction, Client, CommandInteraction } from 'discord.js';
import { AutoCheckin } from 'models';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  const signCheckin = await AutoCheckin.findOne({ where: { userId: interaction.user.id } });
  const cancel = (interaction as ChatInputCommandInteraction).options.getBoolean('cancel');
  if (!signCheckin) {
    if (cancel) {
      await interaction.reply({
        content: 'You are not registered for auto checkin',
        ephemeral: true,
      });
    } else {
      await AutoCheckin.create({ userId: interaction.user.id });
      await interaction.reply({
        content: 'Registered for auto checkin successfully',
        ephemeral: true,
      });
    }
  } else {
    if (!cancel) {
      await interaction.reply({
        content: 'You are already registered for auto checkin',
        ephemeral: true,
      });
      return;
    }
    await AutoCheckin.destroy({ where: { userId: interaction.user.id } });
    await interaction.reply({
      content: 'Unregistered for auto checkin successfully',
      ephemeral: true,
    });
  }
};

export const data: SlashCmd['data'] = {
  name: 'auto_checkin',
  description: 'Automatically check in games you have linked',
  options: [
    {
      name: 'cancel',
      description: 'Cancel auto checkin',
      type: 5,
    },
  ],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
