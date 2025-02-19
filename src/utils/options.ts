export const GAMES = {
  gi: { name: 'Genshin Impact', id: 2, icon: process.env.GI_LOGO },
  hi3: { name: 'Honkai Impact 3rd', id: 1, icon: process.env.HI3_LOGO },
  hsr: { name: 'Honkai Star Rail', id: 6, icon: process.env.HSR_LOGO },
  zzz: { name: 'Zenless Zone Zero', id: 8, icon: process.env.ZZZ_LOGO },
};

export const cookieKeys: string[] = [
  'ltoken',
  'ltoken_v2',
  'ltuid',
  'ltuid_v2',
  'account_id',
  'cookie_token',
  'account_id_v2',
  'account_mid_v2',
  'cookie_token_v2',
  'mi18nLang',
  'ltmid_v2',
];

export const gameRedeemCode: CustomObject<{
  url: string;
  channelNotify: string;
}> = {
  hsr: {
    url: 'https://honkai-star-rail.fandom.com/wiki/Redemption_Code',
    channelNotify: '1341665996301275137',
  },
  gi: {
    url: 'https://genshin-impact.fandom.com/wiki/Promotional_Code',
    channelNotify: '1341666212664447067',
  },
  zzz: {
    url: 'https://zenless-zone-zero.fandom.com/wiki/Redemption_Code',
    channelNotify: '1341666417770238013',
  },
};
