import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

/**
 * Slot rond een modeloplossing.
 *
 * De oplossing (children) wordt pas gerenderd nadat de student de vrijgavecode
 * ingeeft. Omdat we children niet renderen zolang het slot dicht is, staat de
 * oplossing NIET in de statische HTML (dus niet zichtbaar via "view source").
 *
 * Let op: dit is een lichte afscherming. De tekst van de oplossing zit nog wel in
 * de JavaScript-bundel van de pagina; wie de Sources-tab van de browser doorzoekt,
 * kan ze vinden. Voor harde afscherming zou de oplossing server-side moeten leven
 * (zoals de tutor-oplossingen in de Cloudflare Worker). De echte leerwinst zit in
 * de AI-tutor; dit slot houdt de volledige oplossing gewoon een stap verder weg.
 *
 * De code wordt eenmalig per toestel onthouden (localStorage): wie ze ingeeft,
 * ontgrendelt alle modeloplossingen op dat toestel.
 */

const OPSLAG_SLEUTEL = 'cursus-databanken:oplossing-ontgrendeld';
const STANDAARD_CODE = 'databanken';

function normaliseer(waarde) {
  return String(waarde ?? '').trim().toLowerCase();
}

export default function Modeloplossing({children, labo}) {
  const {siteConfig} = useDocusaurusContext();
  const codeUitConfig = siteConfig?.customFields?.oplossing?.code;
  const juisteCode = normaliseer(codeUitConfig ?? STANDAARD_CODE);

  const [ontgrendeld, setOntgrendeld] = useState(false);
  const [invoer, setInvoer] = useState('');
  const [fout, setFout] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(OPSLAG_SLEUTEL) === 'ja') setOntgrendeld(true);
    } catch {
      /* localStorage kan geblokkeerd zijn; slot blijft dan gewoon dicht. */
    }
  }, []);

  function probeer(e) {
    e.preventDefault();
    if (normaliseer(invoer) === juisteCode) {
      setOntgrendeld(true);
      setFout(false);
      try {
        window.localStorage.setItem(OPSLAG_SLEUTEL, 'ja');
      } catch {
        /* niet kunnen bewaren is geen ramp: dan blijft het enkel deze sessie open. */
      }
    } else {
      setFout(true);
    }
  }

  function vergrendel() {
    setOntgrendeld(false);
    setInvoer('');
    try {
      window.localStorage.removeItem(OPSLAG_SLEUTEL);
    } catch {
      /* stil negeren. */
    }
  }

  if (ontgrendeld) {
    return (
      <div className={styles.open}>
        <div className={styles.openBalk}>
          <span className={styles.openLabel}>
            Modeloplossing{labo ? ` — labo ${labo}` : ''} vrijgegeven
          </span>
          <button type="button" className={styles.vergrendel} onClick={vergrendel}>
            Verberg opnieuw
          </button>
        </div>
        <div className={styles.inhoud}>{children}</div>
      </div>
    );
  }

  return (
    <form className={styles.slot} onSubmit={probeer}>
      <div className={styles.slotRij}>
        <span className={styles.slotIcoon} aria-hidden="true">🔒</span>
        <span className={styles.slotLabel}>Modeloplossing</span>
        <input
          type="text"
          className={fout ? styles.invoerFout : styles.invoer}
          value={invoer}
          onChange={(e) => {
            setInvoer(e.target.value);
            setFout(false);
          }}
          placeholder="Vrijgavecode"
          aria-label="Vrijgavecode voor de modeloplossing"
          autoComplete="off"
        />
        <button type="submit" className={styles.knop}>
          Toon
        </button>
      </div>
      {fout ? (
        <p className={styles.foutTekst}>Die code klopt niet. Vraag ze aan je docent.</p>
      ) : (
        <p className={styles.slotUitleg}>
          Probeer eerst zelf en gebruik de AI-tutor. Je docent geeft de code wanneer de
          modeloplossing beschikbaar is. Eenmaal ingegeven blijft ze open op dit toestel.
        </p>
      )}
    </form>
  );
}
