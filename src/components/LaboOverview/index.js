import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Doorlopende labo-reeks. `sub` = afwijkende titel uit het bronmateriaal.
const LABOS = [
  {n: 1},
  {n: 2},
  {n: 3},
  {n: 4},
  {n: 5},
  {n: 6},
  {n: 7},
  {n: 8},
  {n: 9},
  {n: 10},
  {n: 11},
  {n: 12, sub: 'Opdrachten views'},
  {n: 13, sub: 'Opdrachten indexeren'},
  {n: 14},
  {n: 15},
  {n: 16},
  {n: 17},
  {n: 18},
  {n: 19},
  {n: 20},
  {n: 21},
];

const pad = (n) => String(n).padStart(2, '0');

export default function LaboOverview() {
  return (
    <div className={styles.grid}>
      {LABOS.map(({n, sub}) => (
        <Link key={n} to={`labo-${pad(n)}`} className={styles.card}>
          <span className={styles.num}>{pad(n)}</span>
          <span className={styles.body}>
            <span className={styles.title}>Labo {pad(n)}</span>
            {sub && <span className={styles.sub}>{sub}</span>}
          </span>
          <svg
            className={styles.arrow}
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ))}
    </div>
  );
}
