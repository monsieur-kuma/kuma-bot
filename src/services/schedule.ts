import { APIEmbedField, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { groupBy } from 'lodash';
import { Cookies, RedeemCode } from 'models';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { GAMES } from 'utils';
import { checkExpiredCookies, checkInGame } from 'utils/common';
import { autoRedeemCode, fetchCodeOfGame, ICodeFetch } from 'utils/redeem_code';

export const checkInGameSchedule = (client: Client) => {
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

export const redeemCodeSchedule = (client: Client) => {
  const rule = new RecurrenceRule();
  rule.hour = [1, 7, 13, 19];
  rule.minute = 0;
  rule.tz = 'Asia/Jakarta';

  scheduleJob(rule, async () => {
    const games = ['hsr', 'gi', 'zzz'];
    const newCodes: CustomObject<ICodeFetch[]> = {
      hsr: [],
      gi: [],
      zzz: [],
    };
    await Promise.all(
      games.map(async (game) => {
        const codes = await fetchCodeOfGame(game as 'hsr' | 'gi' | 'zzz');
        await Promise.all(
          codes.map(async (code) => {
            const isExist = await RedeemCode.findOne({
              where: {
                code: code.code,
                game,
              },
            });
            if (!isExist) {
              newCodes[game].push(code);
              await RedeemCode.create({
                code: code.code,
                game,
                autoReceived: false,
                discovered: code.discovered,
                valid: code.valid,
                items: code.items,
              });
            } else if (isExist.items.length === 0) {
              isExist.items = code.items;
              await isExist.save();
            }
          })
        );
      })
    );

    await Promise.all(
      Object.entries(newCodes).map(async ([game, codes]) => {
        if (codes.length) {
          const gameInfo = GAMES[game as keyof typeof GAMES];
          const channel = await client.channels.fetch(gameInfo.channelNotify);
          const embedFetchCode = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`Tự động lấy code ${gameInfo.name}`)
            .addFields(
              codes.map((code) => ({
                name: `${code.code}`,
                value: `- ${code.items.join('\n- ')}`,
              }))
            )
            .setTimestamp();
          // redeem code
          await (channel as TextChannel).send({ embeds: [embedFetchCode] });
          const redeemStatus = await autoRedeemCode(
            game as 'hsr' | 'gi' | 'zzz',
            codes.map((code) => code.code),
            client
          );

          const fields: APIEmbedField[] = [];

          Object.entries(redeemStatus).forEach(([code, status]) => {
            fields.push({
              name: code,
              value: `- Thành công: ${status.success.length}\n- Thất bại: ${status.error.length}`,
            });
          });
          const embedRedeemCode = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${GAMES[game as keyof typeof GAMES].name}`)
            .setDescription(`Tự động nhận code:`)
            .addFields(fields)
            .setTimestamp();

          await (channel as TextChannel).send({
            content: `Đã tự động nhận tất cả code: ${Object.keys(redeemStatus)
              .map((code) => `\`${code}\``)
              .join(', ')}`,
          });

          const botOwner = await client.users.fetch(process.env.BOT_OWNER as string);
          await botOwner.send({
            embeds: [embedRedeemCode],
          });
        }
      })
    );
  });
};

export const checkExpiredCookiesSchedule = (client: Client) => {
  const rule = new RecurrenceRule();
  rule.hour = 20;
  rule.minute = 0;
  rule.dayOfWeek = [1, 3, 5];
  rule.tz = 'Asia/Jakarta';

  scheduleJob(rule, async () => {
    const allUserCookies = await Cookies.findAll();
    const expiredCookies: Cookies[] = [];

    await allUserCookies.reduce(async (promise, userCookie, index) => {
      await promise;
      try {
        const isExpired = await checkExpiredCookies(userCookie.cookie);
        if (isExpired) {
          expiredCookies.push(userCookie);
        }

        if (index < allUserCookies.length - 1) {
          await new Promise((r) => {
            setTimeout(r, 1000);
          }); // 1 second delay
        }
        return Promise.resolve();
      } catch (error) {
        Logger.error(`Error checking expired cookies:`, error);
        return Promise.resolve();
      }
    }, Promise.resolve());

    if (expiredCookies.length) {
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTimestamp()
        .setTitle(`Tài khoản đã hết hạn: ${expiredCookies.length}`)
        .setDescription(
          expiredCookies
            .map(
              (cookie) =>
                `- ${(cookie as any).id} - ${
                  client.users.cache.get(cookie.userId)?.username ?? 'Unknown'
                } - ${cookie.userId}`
            )
            .join('\n')
        );
      const botOwner = await client.users.fetch(process.env.BOT_OWNER as string);
      await botOwner.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTimestamp()
        .setTitle('Tài khoản đã hết hạn')
        .setDescription('Không có tài khoản nào đã hết hạn');
      const botOwner = await client.users.fetch(process.env.BOT_OWNER as string);
      await botOwner.send({ embeds: [embed] });
    }
  });
};
