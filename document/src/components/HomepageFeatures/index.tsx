/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import Heading from '@theme/Heading';
import clsx from 'clsx';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    description: <>Kuma Bot is a Discord bot that is easy to use and has a lot of features.</>,
  },
  {
    title: 'Focus on What Matters',
    description: (
      <>
        Kuma Bot is designed to be easy to use and focus on what matters. It is a Discord bot
        helping you to checkin and remdem code in Hoyovert Game.
      </>
    ),
  },
  {
    title: 'Powered by Discord.js',
    description: (
      <>
        Kuma Bot is powered by Discord.js, a powerful library for interacting with the Discord API.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center"></div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
