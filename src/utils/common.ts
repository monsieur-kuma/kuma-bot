import { ICookie, LanguageEnum } from 'michos_api';

import { cookieKeys } from './options';

export function toCamelCase(str: string): string {
  const words = str.split('_');

  const camelCaseWords = words.map((word, index) => {
    // If the word is the first in the array, return it as-is.
    // Otherwise, capitalize the first letter of the word and concatenate it with the rest of the word.
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  });
  return camelCaseWords.join('');
}

export const validCookie = (cookie: string) => {
  return cookie.includes('ltuid') && cookie.includes('ltoken');
};

export const parseCookie = (cookie: string): ICookie | null => {
  if (cookie.includes('{') && cookie.includes('}')) {
    return JSON.parse(cookie);
  }
  if (!validCookie(cookie)) {
    return null;
  }
  const cookies: Map<string, any> = new Map();
  cookie.split(';').forEach((item) => {
    const [key, value] = item.split('=');
    if (cookieKeys.includes(key.trim())) {
      const camelCaseKey = toCamelCase(key.trim());
      const decodedValue = decodeURIComponent(value).trim();
      cookies.set(camelCaseKey, decodedValue);
      if (['ltuid', 'account_id', 'account_id_v2'].includes(key)) {
        cookies.set(key, parseInt(cookies.get(key), 10));
      } else if (key === 'mi18nLang') {
        cookies.set(key, decodedValue || LanguageEnum.ENGLISH);
      }
    }
  });

  const ltuid = cookies.get('ltuid');
  const accountId = cookies.get('accountId');
  const accountIdV2 = cookies.get('accountIdV2');

  if (ltuid && !accountId) {
    cookies.set('accountId', ltuid);
  } else if (!ltuid && accountId) {
    cookies.set('ltuid', accountId);
  }

  if (!accountIdV2 && (accountId || ltuid) !== null) {
    cookies.set('accountIdV2', accountId || ltuid);
  }

  if (!cookies.get('ltokenV2') || !cookies.get('ltuidV2')) {
    return null;
  }

  return Object.fromEntries(cookies) as ICookie;
};
