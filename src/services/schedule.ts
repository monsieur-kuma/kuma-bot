import { Client, EmbedBuilder } from 'discord.js';
import { groupBy } from 'lodash';
import { Cookies } from 'models';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { GAMES } from 'utils';
import { checkInGame } from 'utils/common';

export default (client: Client) => {
  const rule = new RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = 'Asia/Jakarta';

  scheduleJob(rule, async () => {
    const allUserCookies = await Cookies.findAll();
    const groupedUserCookies = groupBy(allUserCookies, 'userId');

    await Promise.all(
      Object.entries(groupedUserCookies).map(async ([userId, userCookies]) => {
        if (userCookies.length) {
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
            .setColor('Random')
            .setTitle('Tự động điểm danh')
            .addFields(results)
            .setTimestamp();
          const user = await client.users.fetch(userId);
          try {
            await user.send({ embeds: [embed] });
          } catch {
            /* empty */
          }
        }
      })
    );
  });
};
