import { Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';
import { checkInGame } from 'utils/common';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });
  const userCookies = await Cookies.findAll({ where: { userId: interaction.user.id } });
  if (!userCookies.length) {
    await interaction.editReply('Không tìm thấy tài khoản Hoyolab đã liên kết');
    return;
  }
  const checkedGames: CustomObject<string[]> = {};
  await Promise.all(
    userCookies.map(async (userCookie) => {
      const { gameInfo, cookie } = userCookie;
      await Promise.all(
        Object.entries(gameInfo).map(async ([gameId, info]) => {
          if (!checkedGames[gameId]) checkedGames[gameId] = [];
          let textRespone = `- **${info.name} (${info.uid})**: `;
          try {
            const status = await checkInGame(cookie, gameId, info);
            if (status?.status === 'OK') {
              textRespone += 'Điểm danh thành công';
            } else {
              textRespone += status?.status ?? 'Failed';
            }
          } catch ({ message }: any) {
            textRespone += message;
          }
          checkedGames[gameId].push(textRespone);
        })
      );
    })
  );

  const results: { name: string; value: string }[] = Object.entries(checkedGames).map(
    ([gameId, value]) => {
      const gameInfo = GAMES[gameId as keyof typeof GAMES];
      return {
        name: `${gameInfo.icon} ${gameInfo.name}`,
        value: value.join('\n'),
      };
    }
  );

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.username || 'Kuma Bot'} - Thông tin điểm danh`,
      iconURL: client.user?.displayAvatarURL() || '',
    })
    .setColor('Random')
    .addFields(results)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
};

export const data: SlashCmd['data'] = {
  name: 'checkin_games',
  description: 'Điểm danh tất cả các trò chơi bạn đã liên kết',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
