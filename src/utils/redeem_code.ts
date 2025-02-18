import { JSDOM } from 'jsdom';
import { List } from 'lodash';

import { gameRedeemCode } from './options';

type ICode = {
  code: string;
  items: string[];
  discovered: number;
  valid: number;
};

const extractHSRCode = (trs: List<Element>): ICode[] => {
  const result: ICode[] = [];
  Array.from(trs).forEach((tr) => {
    const isOld = tr.querySelector('td.bg-old.text-background');
    if (isOld) return;
    const code = tr.querySelector('b > code')?.textContent || '';
    if (code) {
      const data: ICode = {
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

export const fetchCodeOfGame = async (game: 'hsr' | 'gi' | 'zzz'): Promise<ICode[]> => {
  const { url, querySelector } = gameRedeemCode[game];
  const response = await fetch(url);
  const webData = await response.text();
  const dom = new JSDOM(webData);
  const { document } = dom.window;
  const trs = document.querySelectorAll(querySelector);

  switch (game) {
    case 'hsr': {
      return extractHSRCode(trs);
    }
    default: {
      return [];
    }
  }
};
