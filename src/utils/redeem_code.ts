import { Client, EmbedBuilder } from 'discord.js';
import { JSDOM } from 'jsdom';
import { List } from 'lodash';
import {
  GenshinImpact,
  HonkaiStarRail,
  IRedeemCode,
  LanguageEnum,
  ZenlessZoneZero,
} from 'michos_api';
import { Cookies, RedeemCode } from 'models';

import { gameRedeemCode, GAMES } from './options';

export type ICodeFetch = {
  code: string;
  items: string[];
  discovered: number;
  valid: number;
};

type RedeemInfo = {
  game: string;
  code: string;
  cookie: string;
  gameInfo: { uid: number; server: string };
};

const extractHSRCode = (trs: List<Element>): ICodeFetch[] => {
  const result: ICodeFetch[] = [];
  Array.from(trs).forEach((tr) => {
    const isOld = tr.querySelector('td.bg-old.text-background');
    if (isOld) return;
    const code = tr.querySelector('b > code')?.textContent || '';
    if (code) {
      const data: ICodeFetch = {
        code,
        items: [],
        discovered: 0,
        valid: 0,
      };
      const discovered =
        tr.querySelector('.text-background > span.text-tooltip.hover-tooltip')?.textContent || '';
      if (discovered) {
        data.discovered = new Date(discovered).getTime();
      }
      const validText =
        tr.querySelector('.text-background > b > span.text-tooltip.hover-tooltip')?.textContent ||
        '';
      const validDate = validText.replace('Valid until: ', '');
      if (validDate && !validDate.includes('Unknown')) {
        data.valid = new Date(validDate).getTime();
      }

      const items = tr.querySelectorAll('span.item > span.item-text');
      Array.from(items).forEach((item) => {
        const itemText = (item.textContent || '').trim();
        if (itemText) {
          data.items.push(itemText);
        }
      });
      result.push(data);
    }
  });
  return result;
};

const extractZZZCode = (trs: List<Element>): ICodeFetch[] => {
  const result: ICodeFetch[] = [];
  Array.from(trs).forEach((tr) => {
    const code = tr.querySelector('b > code')?.textContent || '';
    const isOld = tr.querySelector('td.bg-red.text-background');
    if (isOld) return;
    if (code) {
      const data: ICodeFetch = {
        code,
        items: [],
        discovered: 0,
        valid: 0,
      };
      const items = tr.querySelectorAll('span.item > span.item-text');
      Array.from(items).forEach((item) => {
        const itemText = (item.textContent || '').trim();
        if (itemText) {
          data.items.push(itemText);
        }
      });

      const discoveredText =
        tr.querySelector('.text-background > span.text-tooltip.hover-tooltip')?.textContent || '';
      const discoveredDate = discoveredText.replace('Discovered: ', '');
      if (discoveredDate && !discoveredDate.includes('Unknown')) {
        data.discovered = new Date(discoveredDate).getTime();
      }

      const validText =
        tr.querySelector('.text-background > b > span.text-tooltip.hover-tooltip')?.textContent ||
        '';
      const validDate = validText.replace('Valid until: ', '');
      if (validDate && !validDate.includes('Unknown')) {
        data.valid = new Date(validDate).getTime();
      }
      result.push(data);
    }
  });
  return result;
};

const extractGICode = (trs: List<Element>): ICodeFetch[] => {
  const result: ICodeFetch[] = [];
  Array.from(trs).forEach((tr) => {
    const code = tr.querySelector('b > code')?.textContent || '';
    if (code) {
      const data: ICodeFetch = {
        code,
        items: [],
        discovered: 0,
        valid: 0,
      };
      const items = tr.querySelectorAll('span.item > span.item-text');
      Array.from(items).forEach((item) => {
        const itemText = (item.textContent || '').trim();
        if (itemText) {
          data.items.push(itemText);
        }
      });

      const description = tr.querySelector('td:nth-child(4)')?.innerHTML || '';
      const splited = description.split('<br>');
      const discovered = splited
        .find((item) => item.includes('Discovered: '))
        ?.replace('Discovered: ', '')
        .trim();
      const valid = splited
        .find((item) => item.includes('Valid until: '))
        ?.replace('Valid until: ', '')
        .trim();

      if (discovered) {
        data.discovered = new Date(discovered).getTime();
      }
      if (valid) {
        data.valid = new Date(valid).getTime();
      }

      result.push(data);
    }
  });
  return result;
};

export const fetchCodeOfGame = async (game: 'hsr' | 'gi' | 'zzz'): Promise<ICodeFetch[]> => {
  const { url } = gameRedeemCode[game];
  const response = await fetch(url);
  const webData = await response.text();
  const dom = new JSDOM(webData);
  const { document } = dom.window;
  const trs = document.querySelectorAll('.wikitable tbody tr');

  switch (game) {
    case 'hsr': {
      return extractHSRCode(trs);
    }
    case 'zzz': {
      return extractZZZCode(trs);
    }
    case 'gi': {
      return extractGICode(trs);
    }
    default: {
      return [];
    }
  }
};

export const redeemCode = async (info: RedeemInfo): Promise<IRedeemCode | null> => {
  const { game, code, cookie, gameInfo } = info;
  switch (game) {
    case 'gi': {
      const gi = new GenshinImpact({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await gi.redeem.claim(code);
      return result;
    }
    case 'hsr': {
      const hsr = new HonkaiStarRail({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await hsr.redeem.claim(code);
      return result;
    }
    case 'zzz': {
      const zzz = new ZenlessZoneZero({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await zzz.redeem.claim(code);
      return result;
    }
    default: {
      return null;
    }
  }
};

export const autoRedeemCode = async (
  game: 'hsr' | 'gi' | 'zzz',
  codes: string[],
  client: Client
) => {
  const userCookies = await Cookies.findAll({
    where: {
      [game]: true,
    },
  });

  const redeemSuccess: string[] = [];

  await codes.reduce(async (promise, code, index) => {
    await promise;
    try {
      const redeemResult: {
        success: string[];
        error: string[];
      } = {
        success: [],
        error: [],
      };
      await Promise.all(
        userCookies.map(async (userCookie) => {
          const result = await redeemCode({
            game,
            code,
            cookie: userCookie.cookie,
            gameInfo: userCookie.gameInfo[game],
          });
          if (result) {
            redeemResult.success.push(userCookie.userId);
            const user = await client.users.fetch(userCookie.userId);
            const embed = new EmbedBuilder()
              .setColor('Random')
              .setTitle(`Tự động nhận code ${GAMES[game].name}`)
              .setThumbnail(client.user?.displayAvatarURL() || '')
              .setDescription(`**Mã đỗi**: ${code}`)
              .addFields([
                {
                  name: `${userCookie.gameInfo[game].name} - UID: ${userCookie.gameInfo[game].uid}`,
                  value: result.message === 'OK' ? (result.data as any).msg : result.message,
                },
              ])
              .setTimestamp();
            user.send({
              embeds: [embed],
            });
          } else {
            redeemResult.error.push(userCookie.userId);
          }
        })
      );
      redeemSuccess.push(code);
      await RedeemCode.update(
        {
          autoReceived: true,
        },
        {
          where: {
            code,
            game,
          },
        }
      );
      Logger.info(
        `Nhận code ${code} thành công: ${redeemResult.success.length} ${redeemResult.success.join(
          ', '
        )}`
      );
      Logger.error(
        `Nhận code ${code} thất bại: ${redeemResult.error.length} ${redeemResult.error.join(', ')}`
      );
      if (index < codes.length - 1) {
        await new Promise((r) => {
          setTimeout(r, 10000);
        }); // 10 seconds delay
      }
      return Promise.resolve();
    } catch (error) {
      Logger.error(`Error redeeming code ${code}:`, error);
      return Promise.resolve();
    }
  }, Promise.resolve());

  return redeemSuccess;
};
