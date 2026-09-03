import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const IconDatabase = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="24" cy="11" rx="14" ry="5.5" />
      <path d="M10 11v11c0 3 6.27 5.5 14 5.5s14-2.5 14-5.5V11" />
      <path d="M10 22v11c0 3 6.27 5.5 14 5.5s14-2.5 14-5.5V22" />
    </g>
  </svg>
);

const IconQuery = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="9" width="34" height="30" rx="4" />
      <path d="M7 17h34" />
      <path d="M14 26l4 4-4 4" />
      <path d="M23 34h11" />
    </g>
  </svg>
);

const IconLab = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6v13L9 36a4 4 0 0 0 3.4 6h23.2A4 4 0 0 0 39 36L28 19V6" />
      <path d="M17 6h14" />
      <path d="M15 29h18" />
    </g>
  </svg>
);

const FeatureList = [
  {
    title: 'Theorie en concepten',
    Icon: IconDatabase,
    description: (
      <>
        Van het relationele model tot normalisatie en ontwerp: de volledige
        cursus stap voor stap, met heldere uitleg en voorbeelden.
      </>
    ),
  },
  {
    title: 'SQL in de praktijk',
    Icon: IconQuery,
    description: (
      <>
        Queries, joins, views, indexen en meer. Alle scripts staan in
        kopieerbare codeblokken zodat je meteen kunt meetypen in MySQL.
      </>
    ),
  },
  {
    title: "Oefeningen en labo's",
    Icon: IconLab,
    description: (
      <>
        21 labo&apos;s in een doorlopende reeks, met opgaven en
        calibratiescripts om je eigen oplossing te controleren.
      </>
    ),
  },
];

function Feature({Icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.card}>
        <div className={styles.featureIcon}>
          <Icon />
        </div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
