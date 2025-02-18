import { Client, CommandInteraction } from 'discord.js';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  await interaction.editReply({ content: 'Đang phát triển...' });
};

export const data: SlashCmd['data'] = {
  name: 'acticve_code',
  description: 'Xem thông tin mã code đang hoạt động',
  options: [
    {
      name: 'game',
      type: 3,
      required: true,
      description: 'Chọn trò chơi',
      choices: [
        {
          name: 'Genshin Impact',
          value: 'gi',
        },
        {
          name: 'Honkai Star Rail',
          value: 'hsr',
        },
        {
          name: 'Zenless Zone Zero',
          value: 'zzz',
        },
      ],
    },
  ],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
