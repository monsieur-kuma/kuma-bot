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

  const results: RestOrArray<APIEmbedField> = [];
  const embed = new EmbedBuilder()
    .setTitle('Thông tin tài khoản')
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setDescription('Danh sách các tài khoản đã liên kết')
    .setTimestamp();

  await Promise.all(
    userCookies.map(async (userCookie, index) => {
      const { gameInfo } = userCookie;
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
    })
  );

  embed.addFields(results);
  await interaction.editReply({ embeds: [embed] });
};

export const data: SlashCmd['data'] = {
  name: 'accounts',
  description: 'Xem thông tin các tài khoản đã liên kết',
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
