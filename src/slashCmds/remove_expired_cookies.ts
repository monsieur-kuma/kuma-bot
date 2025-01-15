import { APIEmbedField, Client, CommandInteraction, EmbedBuilder, RestOrArray } from 'discord.js';
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

  const expiredCookies: Cookies[] = [];
  await Promise.all(
    userCookies.map(async (userCookie) => {
      const isExpired = await checkExpiredCookies(userCookie.cookie);
      if (isExpired) {
        expiredCookies.push(userCookie);
      }
    })
  );

  if (!expiredCookies.length) {
    await interaction.editReply('Không tìm thấy tài khoản đã hết hạn');
    return;
  }

  const cookiesIds = expiredCookies.map(({ dataValues }) => dataValues.id);
  await Cookies.destroy({ where: { id: cookiesIds } });

  const results: RestOrArray<APIEmbedField> = [];
  const embed = new EmbedBuilder()
    .setTitle('Xóa tài khoản đã hết hạn')
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setDescription('Danh sách các tài khoản đã hết hạn')
    .setTimestamp();

  await Promise.all(
    expiredCookies.map(async (userCookie, index) => {
      const { gameInfo } = userCookie;
      const allGames: string[] = [];
      Object.entries(gameInfo).forEach(([gameId, info]) => {
        const game = GAMES[gameId as keyof typeof GAMES];
        allGames.push(`- ${game.icon} **${info.name}** - UID: **${info.uid}**`);
      });
      const value = `${allGames.join('\n')}`;
      results.push({
        name: `Tài khoản ${index + 1}`,
        value,
      });
    })
  );

  embed.addFields(results);
  await interaction.editReply({ embeds: [embed] });
};

export const data: SlashCmd['data'] = {
  name: 'remove_expired_cookies',
  description: 'Xóa tất cả tài khoản đã hết hạn',
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
