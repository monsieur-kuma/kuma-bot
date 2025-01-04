import { ChatInputCommandInteraction, Client, CommandInteraction } from 'discord.js';
import { AutoCheckin } from 'models';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  const signCheckin = await AutoCheckin.findOne({ where: { userId: interaction.user.id } });
  const cancel = (interaction as ChatInputCommandInteraction).options.getBoolean('cancel');
  if (!signCheckin) {
    if (cancel) {
      await interaction.reply({
        content: 'Bạn chưa đăng ký tự động điểm danh',
        ephemeral: true,
      });
    } else {
      await AutoCheckin.create({ userId: interaction.user.id });
      await interaction.reply({
        content: 'Đăng ký tự động điểm danh thành công',
        ephemeral: true,
      });
    }
  } else {
    if (!cancel) {
      await interaction.reply({
        content: 'Bạn đã đăng ký tự động điểm danh rồi',
        ephemeral: true,
      });
      return;
    }
    await AutoCheckin.destroy({ where: { userId: interaction.user.id } });
    await interaction.reply({
      content: 'Hủy đăng ký tự động điểm danh thành công',
      ephemeral: true,
    });
  }
};

export const data: SlashCmd['data'] = {
  name: 'auto_checkin',
  description: 'Tự động điểm danh các trò chơi bạn đã liên kết',
  options: [
    {
      name: 'cancel',
      description: 'Hủy tự động điểm danh',
      type: 5,
    },
  ],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
