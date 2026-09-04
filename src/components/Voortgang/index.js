import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import data from '@site/src/data/oefeningen.json';
import styles from './styles.module.css';

/**
 * Leerlijn + voortgang voor de labo's.
 *
 * - De volgorde en niveaus (L1..L11) komen uit src/data/oefeningen.json, zodat dit
 *   overzicht automatisch mee wijzigt met de leerlijn die de tutor gebruikt.
 * - Per labo staat een vinkje. De voortgang wordt lokaal in de browser bewaard
 *   (localStorage), niet op een server: ze is dus prive en per toestel.
 */

const OPSLAG_SLEUTEL = 'cursus-databanken:voortgang';

// Onderwerp en bijhorende cursushoofdstukken per labo. De niveaubadges (L1..L11)
// worden hieronder uit oefeningen.json afgeleid; dit blijft de "waar lees ik de
// theorie"-koppeling.
const LABOS = [
  {n: '01', onderwerp: 'Debuggen, CREATE, INSERT', theorie: [['DDL', '/docs/my-sql/ddl/']]},
  {n: '02', onderwerp: 'Tabellen en datatypes kiezen', theorie: [['DDL', '/docs/my-sql/ddl/']]},
  {n: '03', onderwerp: 'CREATE en INSERT', theorie: [['DDL', '/docs/my-sql/ddl/']]},
  {n: '04', onderwerp: 'Tabellen en eerste SELECT', theorie: [['DDL', '/docs/my-sql/ddl/'], ['DML', '/docs/my-sql/dml/']]},
  {n: '05', onderwerp: 'SELECT, DISTINCT', theorie: [['SELECT', '/docs/my-sql/select/']]},
  {n: '06', onderwerp: 'GROUP BY, HAVING, COUNT, ORDER BY', theorie: [['Groeperen en samenvatten', '/docs/my-sql/groeperen-en-samenvatten/']]},
  {n: '07', onderwerp: 'apTunes: normalisatie', theorie: [['apTunes', '/docs/my-sql/aptunes']]},
  {n: '08', onderwerp: 'apTunes: veel-op-veel en joins', theorie: [['apTunes', '/docs/my-sql/aptunes'], ['JOINS (Basic)', '/docs/my-sql/joins-basic/']]},
  {n: '09', onderwerp: 'INNER JOIN', theorie: [['JOINS (Basic)', '/docs/my-sql/joins-basic/']]},
  {n: '10', onderwerp: 'JOINs en aggregatie', theorie: [['JOINS (Basic)', '/docs/my-sql/joins-basic/'], ['JOINS (Advanced)', '/docs/my-sql/joins-advanced/']]},
  {n: '11', onderwerp: 'ALTER, FOREIGN KEY, COALESCE', theorie: [['JOINS (Advanced)', '/docs/my-sql/joins-advanced/']]},
  {n: '12', onderwerp: 'Views', theorie: [['Views', '/docs/my-sql/views/']]},
  {n: '13', onderwerp: 'Indexeren', theorie: [['Indexeren', '/docs/my-sql/indexeren/']]},
  {n: '14', onderwerp: 'Subquery, IF, IN, variabelen', theorie: [['Subqueries', '/docs/my-sql/subqueries/']]},
  {n: '15', onderwerp: 'Views en stored programs', theorie: [['Views', '/docs/my-sql/views/'], ['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '16', onderwerp: 'Stored functions en procedures', theorie: [['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '17', onderwerp: 'Stored procedures en functions', theorie: [['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '18', onderwerp: 'Tennis-dataset: views, keys, stored', theorie: [['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '19', onderwerp: 'Stored procedures en cursors', theorie: [['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '20', onderwerp: 'Cursors en triggers', theorie: [['Stored programs', '/docs/my-sql/stored-procedures/']]},
  {n: '21', onderwerp: 'Herhalingsoefeningen', groep: 'H', theorie: []},
];

// Labo 21 is bewust een herhalingsblok dat de hele cursus overspant.
const HERHALING = {code: 'H', titel: 'Herhaling (volledige cursus)'};

// Sommige niveaus hebben geen eigen oefenlabo, maar horen wel bij de leerlijn.
// Dan tonen we waar het niveau wel aan bod komt, zodat de leerlijn volledig blijft.
const GEEN_LABO_UITLEG = {
  L1: 'Opstart: verbinden met de MySQL-server en scripts uitvoeren. Dit oefen je tijdens de eerste sessies, er is geen apart labo voor.',
  L9: "Subquery's komen aan bod in Labo 14, samen met stored programs.",
};

/** Leidt per labonummer de niveaus (L1..L11) af uit de oefeningen-data. */
function niveausPerLabo() {
  const kaart = {};
  for (const [id, oef] of Object.entries(data.oefeningen || {})) {
    const m = id.match(/^L(\d{2})/);
    if (!m || !oef || !oef.hoofdstuk) continue;
    const labo = m[1];
    (kaart[labo] ??= {})[oef.hoofdstuk] = (kaart[labo]?.[oef.hoofdstuk] ?? 0) + 1;
  }
  return kaart;
}

function niveauNummer(code) {
  const n = parseInt(String(code).replace(/^L/, ''), 10);
  return Number.isNaN(n) ? 999 : n;
}

/** Het niveau waar de meeste oefeningen van een labo onder vallen (gelijkspel: laagste). */
function hoofdNiveau(counts) {
  const codes = Object.keys(counts || {});
  if (codes.length === 0) return null;
  codes.sort((a, b) => (counts[b] - counts[a]) || (niveauNummer(a) - niveauNummer(b)));
  return codes[0];
}

export default function Voortgang() {
  const niveaus = data.hoofdstukken || {};
  const perLabo = niveausPerLabo();

  // Groepeer de labo's onder hun hoofdniveau (of onder "Herhaling").
  const groepen = new Map();
  for (const labo of LABOS) {
    const groepCode = labo.groep === 'H' ? 'H' : (hoofdNiveau(perLabo[labo.n]) || 'L1');
    if (!groepen.has(groepCode)) groepen.set(groepCode, []);
    const alleNiveaus = Object.keys(perLabo[labo.n] || {}).sort(
      (a, b) => niveauNummer(a) - niveauNummer(b),
    );
    groepen.get(groepCode).push({...labo, niveaus: alleNiveaus});
  }
  // Toon alle leerlijnniveaus in volgorde (ook zonder eigen labo), dan Herhaling.
  const groepVolgorde = [...Object.keys(niveaus), 'H'];

  // Voortgang uit localStorage (client-side, na de eerste render ingeladen).
  const [gedaan, setGedaan] = useState({});
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    try {
      const opgeslagen = window.localStorage.getItem(OPSLAG_SLEUTEL);
      if (opgeslagen) setGedaan(JSON.parse(opgeslagen));
    } catch {
      /* localStorage kan geblokkeerd zijn; dan starten we gewoon leeg. */
    }
    setGeladen(true);
  }, []);

  function bewaar(nieuw) {
    setGedaan(nieuw);
    try {
      window.localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(nieuw));
    } catch {
      /* stil negeren: voortgang is een gemak, geen noodzaak. */
    }
  }

  function toggle(n) {
    bewaar({...gedaan, [n]: !gedaan[n]});
  }

  function reset() {
    bewaar({});
  }

  const totaal = LABOS.length;
  const aantalGedaan = LABOS.filter((l) => gedaan[l.n]).length;
  const percent = Math.round((aantalGedaan / totaal) * 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.balkRij}>
        <div className={styles.balkBuiten} role="progressbar" aria-valuenow={aantalGedaan} aria-valuemin={0} aria-valuemax={totaal}>
          <div className={styles.balkBinnen} style={{width: `${geladen ? percent : 0}%`}} />
        </div>
        <span className={styles.balkTekst}>
          {geladen ? `${aantalGedaan} / ${totaal} labo's` : `0 / ${totaal} labo's`}
        </span>
        {aantalGedaan > 0 && (
          <button type="button" className={styles.reset} onClick={reset}>
            Wis voortgang
          </button>
        )}
      </div>

      <p className={styles.hint}>
        Vink een labo af als je het afgewerkt hebt. Je voortgang wordt enkel op dit toestel
        in je browser bewaard, niet op een server.
      </p>

      {groepVolgorde.map((code) => {
        const titel = code === 'H' ? HERHALING.titel : (niveaus[code]?.titel ?? code);
        const labos = groepen.get(code) ?? [];
        return (
          <section key={code} className={styles.niveau}>
            <h3 className={styles.niveauTitel}>
              <span className={styles.niveauCode}>{code === 'H' ? 'Herhaling' : code}</span>
              {titel}
            </h3>
            {labos.length === 0 && (
              <p className={styles.geenLabo}>
                {GEEN_LABO_UITLEG[code] ?? 'Dit niveau wordt ingeoefend in de omliggende labo’s.'}
              </p>
            )}
            <ul className={styles.lijst}>
              {labos.map((labo) => {
                const af = !!gedaan[labo.n];
                return (
                  <li key={labo.n} className={af ? styles.rijAf : styles.rij}>
                    <label className={styles.check}>
                      <input type="checkbox" checked={af} onChange={() => toggle(labo.n)} />
                      <span className={styles.vinkje} aria-hidden="true" />
                    </label>
                    <div className={styles.inhoud}>
                      <Link to={`/oefeningen/labo-${labo.n}`} className={styles.laboLink}>
                        Labo {labo.n}
                      </Link>
                      <span className={styles.onderwerp}>{labo.onderwerp}</span>
                      {labo.theorie.length > 0 && (
                        <span className={styles.theorie}>
                          theorie:{' '}
                          {labo.theorie.map(([label, to], i) => (
                            <React.Fragment key={to}>
                              {i > 0 && ', '}
                              <Link to={to}>{label}</Link>
                            </React.Fragment>
                          ))}
                        </span>
                      )}
                    </div>
                    <div className={styles.badges}>
                      {labo.niveaus.map((niv) => (
                        <span key={niv} className={styles.badge} title={niveaus[niv]?.titel ?? niv}>
                          {niv}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
