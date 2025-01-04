/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import clsx from 'clsx';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: translate({ message: 'Dễ sử dụng', id: 'homepage.easyToUse' }),
    description: (
      <Translate id="homepage.easyToUse.description">
        Kuma Bot là một bot Discord dễ sử dụng và có nhiều tính năng.
      </Translate>
    ),
  },
  {
    title: translate({
      message: 'Tập trung tiện nghi',
      id: 'homepage.focusOnWhatMatters',
    }),
    description: (
      <Translate id="homepage.focusOnWhatMatters.description">
        Kuma Bot được thiết kế để dễ sử dụng và tập trung vào những gì quan trọng. Đây là một bot
        Discord giúp bạn điểm danh và đổi mã trong trò chơi Hoyoverse.
      </Translate>
    ),
  },
  {
    title: translate({ message: 'Xây dựng bằng Discord.js', id: 'homepage.powered' }),
    description: (
      <Translate id="homepage.powered.description">
        Kuma Bot được hỗ trợ bởi Discord.js, một thư viện mạnh mẽ để tương tác với API của Discord.
      </Translate>
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
