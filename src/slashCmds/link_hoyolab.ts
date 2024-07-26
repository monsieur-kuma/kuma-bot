import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Hoyolab } from 'michos_api';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';

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
        const cookie = modalInteraction.components[0].components[0].value;
        const hoyolab = new Hoyolab({ cookie: JSON.parse(cookie) });
        const gameRecords = await hoyolab.gameRecordCard();
        const gameInfo: CustomObject<{ uid: number; server: string }> = {};
        options.forEach(({ name }) => {
          const game = gameRecords.find(
            (record) => record.game_id === GAMES[name as keyof typeof GAMES].id
          );
          if (game) {
            gameInfo[name] = { uid: Number(game.game_role_id), server: game.region };
          }
        });
        Cookies.create({ userId: interaction.user.id, cookie, gameInfo });
        await modalInteraction.reply('Account linked successfully');
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
