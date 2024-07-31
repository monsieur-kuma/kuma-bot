import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });
  const userCookies = await Cookies.findAll({ where: { userId: interaction.user.id } });
  if (!userCookies.length) {
    await interaction.editReply('You have not linked your Hoyolab account');
    return;
  }

  const results: { name: string; value: string }[] = [];
  const options: StringSelectMenuOptionBuilder[] = [];

  userCookies.forEach((userCookie, index) => {
    const { gameInfo } = userCookie;
    const { id } = userCookie.dataValues;

    const allGames: string[] = [];
    Object.entries(gameInfo).forEach(([gameId, info]) => {
      allGames.push(`${GAMES[gameId as keyof typeof GAMES].name} - ${info.name} - ${info.uid}`);
    });
    results.push({
      name: `Account ${index + 1}`,
      value: allGames.join('\n'),
    });

    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(`Account ${index + 1}`)
        .setValue(`${id}`)
        .setDescription(`Select account ${index + 1}`)
    );
  });

  const embed = new EmbedBuilder()
    .setTitle('Unlink Hoyolab Account')
    .setDescription('Select the account you want to unlink')
    .addFields(results)
    .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_unlink')
    .addOptions(options)
    .setPlaceholder('Select an account to unlink');

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  const message = await interaction.editReply({ embeds: [embed], components: [row] });

  await message
    .awaitMessageComponent({
      time: 5000,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'select_unlink',
    })
    .then(async (selectInteraction) => {
      const selectedId = (selectInteraction as StringSelectMenuInteraction).values[0];
      Cookies.destroy({ where: { id: Number(selectedId) } });
      await interaction.editReply({
        content: 'Unlinked successfully',
        embeds: [],
        components: [],
      });
    });
};

export const data: SlashCmd['data'] = {
  name: 'unlink_hoyolab',
  description: 'Un Link your Hoyolab account',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
