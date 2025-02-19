import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { groupBy } from 'lodash';
import { Cookies, RedeemCode } from 'models';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { gameRedeemCode, GAMES } from 'utils';
import { checkInGame } from 'utils/common';
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
  rule.hour = 1;
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
          const channel = await client.channels.fetch(gameRedeemCode[game].channelNotify);
          const gameInfo = GAMES[game as keyof typeof GAMES];
          const embedFetchCode = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`Tự động lấy code ${gameInfo.name}`)
            .addFields(
              codes.map((code) => ({
                name: `${code.code}`,
                value: `- ${code.items.join('\n- ')}`,
              }))
            );
          // redeem code
          await (channel as TextChannel).send({ embeds: [embedFetchCode] });
          const redeemSuccess = await autoRedeemCode(
            game as 'hsr' | 'gi' | 'zzz',
            codes.map((code) => code.code),
            client
          );
          const redeemFailed = codes.filter((code) => !redeemSuccess.includes(code.code));
          const fields = [];
          if (redeemSuccess.length > 0) {
            fields.push({
              name: 'Thành công',
              value: `- ${redeemSuccess.join('\n- ')}`,
            });
          }
          if (redeemFailed.length > 0) {
            fields.push({
              name: 'Thất bại',
              value: `- ${redeemFailed.join('\n- ')}`,
            });
          }
          const embedRedeemCode = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${GAMES[game as keyof typeof GAMES].name}`)
            .setDescription(`Tự động nhận code:`)
            .addFields(fields);
          await (channel as TextChannel).send({ embeds: [embedRedeemCode] });
        }
      })
    );
  });
};
