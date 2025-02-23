export const GAMES = {
  gi: {
    name: 'Genshin Impact',
    id: 2,
    icon: process.env.GI_LOGO,
    wikiRedeemCode: 'https://genshin-impact.fandom.com/wiki/Promotional_Code',
    channelNotify: process.env.GI_NOTIFY || '',
    logo: 'https://fastcdn.hoyoverse.com/static-resource-v2/2023/11/08/9db76fb146f82c045bc276956f86e047_6878380451593228482.png',
  },
  hi3: {
    name: 'Honkai Impact 3rd',
    id: 1,
    icon: process.env.HI3_LOGO,
    wikiRedeemCode: '',
    channelNotify: '',
    logo: 'https://fastcdn.hoyoverse.com/static-resource-v2/2025/02/20/b6a51d3139836b1063fe37a6ceae36c1_2186477288419611200.jpg',
  },
  hsr: {
    name: 'Honkai Star Rail',
    id: 6,
    icon: process.env.HSR_LOGO,
    wikiRedeemCode: 'https://honkai-star-rail.fandom.com/wiki/Redemption_Code',
    channelNotify: process.env.HSR_NOTIFY || '',
    logo: 'https://hyl-static-res-prod.hoyolab.com/communityweb/business/starrail_hoyoverse.png',
  },
  zzz: {
    name: 'Zenless Zone Zero',
    id: 8,
    icon: process.env.ZZZ_LOGO,
    wikiRedeemCode: 'https://zenless-zone-zero.fandom.com/wiki/Redemption_Code',
    channelNotify: process.env.ZZZ_NOTIFY || '',
    logo: 'https://hyl-static-res-prod.hoyolab.com/communityweb/business/nap.png',
  },
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
