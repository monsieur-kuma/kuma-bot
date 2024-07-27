import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Hoyolab } from 'michos_api';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';
import { parseCookie } from 'utils/common';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  const options = interaction.options.data;
  if (!options.length) {
    await interaction.reply('Please select a game to link');
    return;
  }
  const modal = new ModalBuilder().setTitle('Link Hoyolab Account').setCustomId('link_hoyolab');

  const cookieInput = new TextInputBuilder()
    .setLabel('Hoyolab Cookie')
    .setPlaceholder('Paste your Hoyolab cookie here')
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
          await modalInteraction.reply('Invalid cookie provided');
          return;
        }
        const hoyolab = new Hoyolab({ cookie });
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
          .setTitle('Linked Hoyolab Account')
          .addFields(results)
          .setTimestamp();
        await modalInteraction.reply({ embeds: [embed], ephemeral: true });
      });
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content: 'An error occurred while linking your account',
      ephemeral: true,
    });
  }
};

export const data: SlashCmd['data'] = {
  name: 'link_hoyolab',
  description: 'Link your Hoyolab account',
  options: Object.entries(GAMES).map(([key, value]) => ({
    name: key,
    description: `Link account ${value.name}`,
    type: 5,
  })),
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
