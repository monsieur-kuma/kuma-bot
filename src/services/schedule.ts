import { Client, EmbedBuilder } from 'discord.js';
import { AutoCheckin, Cookies } from 'models';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { GAMES } from 'utils';
import { checkInGame } from 'utils/common';

export default (client: Client) => {
  const rule = new RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = 'Asia/Jakarta';

  scheduleJob(rule, async () => {
    const allUser = await AutoCheckin.findAll();
    await Promise.all(
      allUser.map(async ({ userId }) => {
        const userCookies = await Cookies.findAll({ where: { userId } });
        if (userCookies.length) {
          const results: { name: string; value: string }[] = [];
          await Promise.all(
            userCookies.map(async (userCookie) => {
              const { gameInfo, cookie } = userCookie;
              await Promise.all(
                Object.entries(gameInfo).map(async ([gameId, info]) => {
                  const status = await checkInGame(cookie, gameId, info);
                  results.push({
                    name: GAMES[gameId as keyof typeof GAMES].name,
                    value:
                      status?.status === 'OK' ? 'Check in successful' : status?.status ?? 'Failed',
                  });
                })
              );
            })
          );
          const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Auto Checkin status')
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
