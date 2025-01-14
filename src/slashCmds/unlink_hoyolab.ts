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
import { checkExpiredCookies } from 'utils/common';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });
  const userCookies = await Cookies.findAll({ where: { userId: interaction.user.id } });
  if (!userCookies.length) {
    await interaction.editReply('Bạn chưa liên kết tài khoản Hoyolab của mình');
    return;
  }

  const results: { name: string; value: string }[] = [];
  const options: StringSelectMenuOptionBuilder[] = [];

  await Promise.all(
    userCookies.map(async (userCookie, index) => {
      const { gameInfo } = userCookie;
      const { id } = userCookie.dataValues;
      const allGames: string[] = [];
      const isExpired = await checkExpiredCookies(userCookie.cookie);
      Object.entries(gameInfo).forEach(([gameId, info]) => {
        const game = GAMES[gameId as keyof typeof GAMES];
        allGames.push(`- ${game.icon} **${info.name}** - UID: **${info.uid}**`);
      });
      const value = `${allGames.join('\n')}\n\`\`\`Cookie status: ${
        isExpired ? 'Hết hạn' : 'Hoạt động'
      }\`\`\``;
      results.push({
        name: `Tài khoản ${index + 1}`,
        value,
      });
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(`Tài khoản ${index + 1}`)
          .setValue(`${id}`)
          .setDescription(`Chọn tài khoản ${index + 1}`)
      );
    })
  );

  const embed = new EmbedBuilder()
    .setTitle('Hủy liên kết tài khoản Hoyolab')
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setDescription('Chọn tài khoản bạn muốn hủy liên kết')
    .addFields(results)
    .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_unlink')
    .addOptions(options)
    .setPlaceholder('Chọn tài khoản để hủy liên kết');

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  const message = await interaction.editReply({ embeds: [embed], components: [row] });

  await message
    .awaitMessageComponent({
      time: 60000,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'select_unlink',
    })
    .then(async (selectInteraction) => {
      const selectedId = (selectInteraction as StringSelectMenuInteraction).values[0];
      Cookies.destroy({ where: { id: Number(selectedId) } });
      await interaction.editReply({
        content: 'Hủy liên kết thành công',
        embeds: [],
        components: [],
      });
    });
};

export const data: SlashCmd['data'] = {
  name: 'unlink_hoyolab',
  description: 'Hủy liên kết tài khoản Hoyolab của bạn',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
