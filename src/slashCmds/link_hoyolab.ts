import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Hoyolab, LanguageEnum } from 'michos_api';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';
import { parseCookie } from 'utils/common';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  const options = interaction.options.data;
  if (!options.length) {
    await interaction.reply('Vui lòng chọn các trò chơi muốn liên kết');
    return;
  }
  const modal = new ModalBuilder()
    .setTitle('Liên kết tài khoản Hoyolab')
    .setCustomId('link_hoyolab');

  const cookieInput = new TextInputBuilder()
    .setLabel('Cookie Hoyolab')
    .setPlaceholder('Dán cookie Hoyolab của bạn vào đây')
    .setCustomId('cookie')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const action = new ActionRowBuilder<TextInputBuilder>().addComponents(cookieInput);
  modal.addComponents(action);
  await interaction.showModal(modal);

  try {
    await interaction
      .awaitModalSubmit({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'link_hoyolab',
      })
      .then(async (modalInteraction) => {
        const userInput = modalInteraction.components[0].components[0].value;
        const cookie = parseCookie(userInput);
        if (!cookie) {
          await modalInteraction.reply('Cookie không hợp lệ');
          return;
        }
        const hoyolab = new Hoyolab({ cookie, lang: LanguageEnum.VIETNAMESE });
        const gameRecords = await hoyolab.gameRecordCard();
        const gameInfo: CustomObject<{ uid: number; server: string; name: string }> = {};
        const results: { name: string; value: string }[] = [];
        options.forEach(({ name }) => {
          const gameData = GAMES[name as keyof typeof GAMES];
          const game = gameRecords.find((record) => record.game_id === gameData.id);
          if (game) {
            gameInfo[name] = {
              uid: Number(game.game_role_id),
              server: game.region,
              name: game.nickname,
            };
            results.push({
              name: gameData.name,
              value: `${game.nickname} - UID: ${game.game_role_id}`,
            });
          }
        });
        Cookies.create({ userId: interaction.user.id, cookie: JSON.stringify(cookie), gameInfo });
        const embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle('Liên kết thành công')
          .addFields(results)
          .setTimestamp();
        await modalInteraction.reply({ embeds: [embed], ephemeral: true });
      });
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi liên kết tài khoản của bạn',
      ephemeral: true,
    });
  }
};

export const data: SlashCmd['data'] = {
  name: 'link_hoyolab',
  description: 'Liên kết tài khoản Hoyolab của bạn',
  options: Object.entries(GAMES).map(([key, value]) => ({
    name: key,
    description: `Liên kết tài khoản ${value.name}`,
    type: 5,
  })),
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
