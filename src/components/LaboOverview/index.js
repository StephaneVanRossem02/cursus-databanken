import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Doorlopende labo-reeks. `sub` = hoofdstuk uit de cursus waar het labo bij hoort.
const LABOS = [
  {n: 1, sub: 'DDL'},
  {n: 2, sub: 'DDL'},
  {n: 3, sub: 'DDL'},
  {n: 4, sub: 'DDL + SELECT'},
  {n: 5, sub: 'SELECT'},
  {n: 6, sub: 'Groeperen'},
  {n: 7, sub: 'apTunes: normalisatie'},
  {n: 8, sub: 'apTunes: joins'},
  {n: 9, sub: 'JOINs'},
  {n: 10, sub: 'JOINs'},
  {n: 11, sub: 'JOINs (advanced)'},
  {n: 12, sub: 'Views'},
  {n: 13, sub: 'Indexeren'},
  {n: 14, sub: 'Subqueries'},
  {n: 15, sub: 'Views + stored programs'},
  {n: 16, sub: 'Stored functions'},
  {n: 17, sub: 'Stored procedures'},
  {n: 18, sub: 'Herhaling (tennis)'},
  {n: 19, sub: 'Cursors'},
  {n: 20, sub: 'Triggers'},
  {n: 21, sub: 'Herhaling'},
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
