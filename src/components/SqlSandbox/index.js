import React, {useCallback, useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/**
 * SQL-oefensandbox die volledig in de browser draait (SQLite via sql.js/WASM),
 * met een echte code-editor (Ace) die SQL kleurt en tabel- en kolomnamen
 * autoaanvult op basis van het schema van dit labo.
 *
 * Bedoeld voor de query-labo's (01-10). Het calibratiescript wordt automatisch
 * uitgevoerd; de student hoeft niets voor te bereiden. De databank wordt lui
 * gebouwd (pas bij gebruik), zodat meerdere sandboxes per pagina licht blijven.
 *
 * Een script wordt statement per statement uitgevoerd, zodat de student per
 * statement feedback krijgt (welk statement, welke regel, hoeveel rijen, welke
 * fout) in plaats van enkel het laatste resultaat van het hele script.
 *
 * Let op: dit is SQLite, geen MySQL. Voor gewone SELECT/GROUP BY/JOIN is dat
 * gelijk, maar enkele functies verschillen (bv. IF() -> IIF()). Stored procedures,
 * cursors en triggers (labo 11+) horen op de echte MySQL-server in Workbench.
 */

// --- sql.js (SQLite in WASM), van CDN, een keer per pagina ---
const SQLJS_BASIS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
// --- Ace-editor, van jsDelivr (volledige build met themes) ---
const ACE_BASIS = 'https://cdn.jsdelivr.net/npm/ace-builds@1.35.0/src-min-noconflict/';

function laadScript(src) {
  return new Promise((resolve, reject) => {
    const bestaand = document.querySelector(`script[data-src="${src}"]`);
    if (bestaand) {
      if (bestaand.dataset.geladen) resolve();
      else {
        bestaand.addEventListener('load', () => resolve());
        bestaand.addEventListener('error', () => reject(new Error(`kon ${src} niet laden`)));
      }
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.dataset.src = src;
    s.onload = () => {
      s.dataset.geladen = 'ja';
      resolve();
    };
    s.onerror = () => reject(new Error(`kon ${src} niet laden`));
    document.head.appendChild(s);
  });
}

let sqljsBelofte = null;
function laadSqlJs() {
  if (sqljsBelofte) return sqljsBelofte;
  sqljsBelofte = laadScript(SQLJS_BASIS + 'sql-wasm.js').then(() =>
    window.initSqlJs({locateFile: (f) => SQLJS_BASIS + f}),
  );
  return sqljsBelofte;
}

let aceBelofte = null;
let completerToegevoegd = false;
function laadAce() {
  if (aceBelofte) return aceBelofte;
  aceBelofte = (async () => {
    await laadScript(ACE_BASIS + 'ace.js');
    window.ace.config.set('basePath', ACE_BASIS);
    await laadScript(ACE_BASIS + 'ext-language_tools.js');
    return window.ace;
  })();
  return aceBelofte;
}

// Eén globale completer die het schema van de actieve editor gebruikt (editor.$dbSchema),
// zodat sandboxes van verschillende labo's naast elkaar kunnen bestaan.
function registreerSchemaCompleter(ace) {
  if (completerToegevoegd) return;
  const langTools = ace.require('ace/ext/language_tools');
  langTools.addCompleter({
    getCompletions(editor, session, pos, prefix, callback) {
      const schema = editor.$dbSchema || {};
      const items = [];
      for (const [tabel, kolommen] of Object.entries(schema)) {
        items.push({caption: tabel, value: tabel, meta: 'tabel', score: 1000});
        for (const k of kolommen) {
          items.push({caption: k, value: k, meta: `kolom · ${tabel}`, score: 900});
        }
      }
      callback(null, items);
    },
  });
  completerToegevoegd = true;
}

// Schema (tabel -> kolommen) uit het SQLite-script halen, voor de autocompletie.
function ontleedSchema(sql) {
  const map = {};
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
  let m;
  while ((m = re.exec(sql))) {
    const kolommen = [];
    for (let regel of m[2].split('\n')) {
      regel = regel.trim().replace(/,+$/, '');
      if (!regel) continue;
      if (/^(primary|foreign|unique|key|constraint|check)\b/i.test(regel)) continue;
      const km = regel.match(/^["`]?(\w+)["`]?/);
      if (km) kolommen.push(km[1]);
    }
    map[m[1]] = kolommen;
  }
  return map;
}

// Lichte MySQL -> SQLite vertaalslag op de invoer van de student, zodat MySQL-DDL
// (labo 01-03) werkt. Bewust minimaal: SQLite aanvaardt de meeste types (YEAR,
// TINYINT UNSIGNED...) gewoon als typenaam, dus we raken enkel aan wat echt breekt.
function vertaalStudentSql(sql) {
  let s = sql;
  // MySQL backslash-escape -> SQLite.
  s = s.replace(/\\'/g, "''");
  // SQLite kent maar een databank: USE / CREATE DATABASE negeren i.p.v. erop stuk te lopen.
  // (Ook zonder puntkomma, want een statement is hier al op ; gesplitst.)
  s = s.replace(/^[ \t]*USE[ \t]+[^;]*;?/gim, '');
  s = s.replace(/^[ \t]*CREATE[ \t]+DATABASE[^;]*;?/gim, '');
  // MySQL sessie-instellingen (SET sql_safe_updates, SET foreign_key_checks, SET @var, ...)
  // negeren. SQLite kent geen los SET-statement. Enkel bekende sessie-variabelen worden
  // geraakt, dus een UPDATE ... SET kolom = ... blijft ongemoeid.
  s = s.replace(
    /^[ \t]*SET[ \t]+(?:SESSION[ \t]+|GLOBAL[ \t]+)?(?:@[A-Za-z_]\w*|SQL_SAFE_UPDATES|FOREIGN_KEY_CHECKS|UNIQUE_CHECKS|SQL_MODE|SQL_NOTES|AUTOCOMMIT|TIME_ZONE|NAMES|CHARACTER_SET_\w+|COLLATION_\w+)\b[^;]*;?/gim,
    '',
  );
  // ") ENGINE=... " op tabeleinde weg (tot aan de ;).
  s = s.replace(/\)\s*ENGINE\s*=[^;]*/gi, ')');
  // AUTO_INCREMENT bestaat niet in SQLite. Een kolom met AUTO_INCREMENT krijgt type
  // INTEGER, zodat "INTEGER PRIMARY KEY" vanzelf optelt (zoals AUTO_INCREMENT in MySQL).
  s = s.replace(/(["`]?\w+["`]?\s+)[A-Za-z]+(?:\s+unsigned)?\s+AUTO_INCREMENT/gi, '$1INTEGER');
  s = s.replace(/\s*\bAUTO_INCREMENT\b/gi, '');
  // enum('a','b') met kolomnaam ervoor -> TEXT met CHECK, zodat de waardecontrole
  // behouden blijft (belangrijk voor labo 02: een fout datatype moet ook echt falen).
  s = s.replace(/(["`]?\w+["`]?)(\s+)enum\s*\(([^)]*)\)/gi, (m, kol, sp, lijst) => {
    const naam = kol.replace(/["`]/g, '');
    return `${kol}${sp}TEXT CHECK(${naam} IN (${lijst}))`;
  });
  // set('a','b') -> TEXT (MySQL SET-type, zeldzaam).
  s = s.replace(/(["`]?\w+["`]?\s+)set\s*\(([^)]*)\)/gi, '$1TEXT');
  return s;
}

// --- Script opsplitsen in statements -------------------------------------------------
// Splitst op ';', maar respecteert tekst tussen quotes ('...', "...", `...`) en
// commentaar (--, #, /* */). Onthoudt ook op welke regel elk statement begint,
// zodat de feedback naar de juiste regel in de editor kan verwijzen.
function splitsStatements(script) {
  const stukken = [];
  let buffer = '';
  let regelNu = 1;
  let startRegel = null;

  const bewaar = () => {
    const tekst = buffer.trim();
    if (tekst) stukken.push({sql: tekst, regel: startRegel || regelNu});
    buffer = '';
    startRegel = null;
  };
  const neem = (stuk) => {
    if (startRegel === null && stuk.trim()) startRegel = regelNu;
    buffer += stuk;
    const nieuweRegels = stuk.match(/\n/g);
    if (nieuweRegels) regelNu += nieuweRegels.length;
  };

  let i = 0;
  const n = script.length;
  while (i < n) {
    const c = script[i];
    const c2 = script[i + 1];

    // Regelcommentaar: -- ... of # ...
    if ((c === '-' && c2 === '-') || c === '#') {
      const eind = script.indexOf('\n', i);
      const stuk = eind === -1 ? script.slice(i) : script.slice(i, eind);
      neem(stuk);
      i += stuk.length;
      continue;
    }
    // Blokcommentaar: /* ... */
    if (c === '/' && c2 === '*') {
      const eind = script.indexOf('*/', i + 2);
      const stuk = eind === -1 ? script.slice(i) : script.slice(i, eind + 2);
      neem(stuk);
      i += stuk.length;
      continue;
    }
    // Tekstwaarden en quoted namen.
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      let stuk = c;
      while (j < n) {
        const d = script[j];
        if (d === '\\' && c === "'" && j + 1 < n) {
          stuk += script.slice(j, j + 2);
          j += 2;
          continue;
        }
        stuk += d;
        j += 1;
        if (d === c) {
          if (script[j] === c) {
            // Verdubbelde quote binnen de tekst ('' of ""): hoort er nog bij.
            stuk += c;
            j += 1;
            continue;
          }
          break;
        }
      }
      neem(stuk);
      i = j;
      continue;
    }
    // Einde van een statement.
    if (c === ';') {
      bewaar();
      i += 1;
      continue;
    }
    neem(c);
    i += 1;
  }
  bewaar();
  return stukken;
}

// Commentaar weghalen, om het soort statement te kunnen herkennen.
function zonderCommentaar(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^[ \t]*(?:--|#)[^\n]*$/gm, '')
    .trim();
}

// Korte omschrijving van een statement: het soort (SELECT, INSERT, ...) en, waar
// zinvol, de tabel waarover het gaat. Dat vormt de titel van het feedbackblok.
function beschrijfStatement(sql) {
  const kaal = zonderCommentaar(sql).replace(/\s+/g, ' ').trim();
  const eerste = (kaal.match(/^([A-Za-z_]+)/) || [, ''])[1].toUpperCase();
  const naam = (re) => {
    const m = kaal.match(re);
    return m ? m[1].replace(/["`]/g, '') : '';
  };
  switch (eerste) {
    case 'SELECT':
    case 'WITH':
    case 'VALUES':
    case 'PRAGMA':
    case 'EXPLAIN':
      return {soort: eerste, label: eerste};
    case 'INSERT':
      return {soort: 'INSERT', label: `INSERT INTO ${naam(/into\s+["`]?(\w+)/i)}`.trim()};
    case 'REPLACE':
      return {soort: 'INSERT', label: `REPLACE INTO ${naam(/into\s+["`]?(\w+)/i)}`.trim()};
    case 'UPDATE':
      return {soort: 'UPDATE', label: `UPDATE ${naam(/^update\s+["`]?(\w+)/i)}`.trim()};
    case 'DELETE':
      return {soort: 'DELETE', label: `DELETE FROM ${naam(/from\s+["`]?(\w+)/i)}`.trim()};
    case 'CREATE':
    case 'DROP':
    case 'ALTER': {
      const m = kaal.match(
        /^\w+\s+(?:temporary\s+|unique\s+)?(table|view|index|trigger|database)\b/i,
      );
      const ding = m ? m[1].toUpperCase() : '';
      const object = naam(
        /^\w+\s+(?:temporary\s+|unique\s+)?(?:table|view|index|trigger|database)\s+(?:if\s+not\s+exists\s+|if\s+exists\s+)?["`]?(\w+)/i,
      );
      return {soort: eerste, ding, object, label: `${eerste} ${ding} ${object}`.trim()};
    }
    default:
      return {soort: eerste || 'SQL', label: eerste || 'SQL'};
  }
}

// Feedbackzin voor een geslaagd statement dat geen tabel oplevert.
function geluktMelding(info, gewijzigd) {
  const rijen = (aantal) => `${aantal} rij${aantal === 1 ? '' : 'en'}`;
  const ding = (info.ding || 'TABLE').toLowerCase();
  const dingNl = {table: 'Tabel', view: 'View', index: 'Index', trigger: 'Trigger'}[ding] || 'Object';
  const object = info.object ? ` ${info.object}` : '';
  switch (info.soort) {
    case 'INSERT':
      return `${rijen(gewijzigd)} toegevoegd.`;
    case 'UPDATE':
      return `${rijen(gewijzigd)} gewijzigd.`;
    case 'DELETE':
      return `${rijen(gewijzigd)} verwijderd.`;
    case 'CREATE':
      return `${dingNl}${object} aangemaakt.`;
    case 'DROP':
      return `${dingNl}${object} verwijderd.`;
    case 'ALTER':
      return `${dingNl}${object} aangepast.`;
    default:
      return 'Uitgevoerd.';
  }
}

// De SQL van een statement op een regel, voor in de kop van het feedbackblok.
function voorbeeldRegel(sql) {
  const opEenRegel = sql.replace(/\s+/g, ' ').trim();
  return opEenRegel.length > 110 ? `${opEenRegel.slice(0, 110)}...` : opEenRegel;
}

// Actueel schema (tabel -> kolommen) uit de live databank halen, voor de autocompletie.
// Zo leren zelfgemaakte tabellen (DDL-labo's) meteen mee.
function schemaUitDb(db) {
  const map = {};
  try {
    const res = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    if (res[0]) {
      for (const [naam] of res[0].values) {
        const info = db.exec(`PRAGMA table_info("${naam}")`);
        map[naam] = info[0] ? info[0].values.map((r) => r[1]) : [];
      }
    }
  } catch {
    /* stil */
  }
  return map;
}

// Volledige structuur van de databank uitlezen: tabellen en views met hun kolommen,
// datatype, verplicht (NOT NULL) en primaire sleutel. Dit voedt het schemapaneel,
// zodat de student ziet wat zijn DDL echt heeft aangemaakt.
function leesStructuur(db) {
  const uit = [];
  try {
    const res = db.exec(
      "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') " +
        "AND name NOT LIKE 'sqlite_%' ORDER BY type, name",
    );
    if (res[0]) {
      for (const [naam, soort] of res[0].values) {
        const info = db.exec(`PRAGMA table_info("${naam}")`);
        const kolommen = info[0]
          ? info[0].values.map((r) => ({
              naam: r[1],
              type: r[2] || '',
              verplicht: Boolean(r[3]),
              sleutel: Boolean(r[5]),
            }))
          : [];
        uit.push({naam, soort, kolommen});
      }
    }
  } catch {
    /* stil */
  }
  return uit;
}

// Schema-tekst een keer per URL ophalen (gedeeld door DB-opbouw en autocompletie).
const schemaCache = new Map();
function haalSchemaTekst(url) {
  if (!schemaCache.has(url)) {
    schemaCache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`dataset niet gevonden (${r.status})`);
        return r.text();
      }),
    );
  }
  return schemaCache.get(url);
}

const MAX_RIJEN = 200;
// Bij een heel lang script (bv. een geplakte dump) tonen we niet honderden blokken.
const MAX_BLOKKEN = 50;

// Gedeelde databanken per "groep": meerdere sandboxes (bv. de drie debug-scripts van
// een oefening) werken zo op dezelfde databank, net als aparte scripts tegen een
// MySQL-databank. Sleutel -> {db} of {belofte} tijdens het opbouwen.
const gedeeldeDbs = new Map();

async function bouwLegeOfDataDb(leeg, schemaUrl) {
  const SQL = await laadSqlJs();
  const db = new SQL.Database();
  if (!leeg) db.run(await haalSchemaTekst(schemaUrl));
  return db;
}

function donkerThema() {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}
const ACE_THEMA_LICHT = 'ace/theme/textmate';
const ACE_THEMA_DONKER = 'ace/theme/tomorrow_night';

function Resultaattabel({resultaat}) {
  return (
    <div className={styles.resultaatwrap}>
      <table className={styles.tabel}>
        <thead>
          <tr>
            {resultaat.kolommen.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resultaat.rijen.map((rij, i) => (
            <tr key={i}>
              {rij.map((cel, j) => (
                <td key={j}>{cel === null ? <em className={styles.nul}>NULL</em> : String(cel)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.telling}>
        {resultaat.totaal} rij{resultaat.totaal === 1 ? '' : 'en'}
        {resultaat.totaal > MAX_RIJEN ? ` (eerste ${MAX_RIJEN} getoond)` : ''}
      </p>
    </div>
  );
}

// Eén tabel (of view) in de schemaboom: openklikken toont de velden met hun datatype,
// net zoals je in Workbench een tabel openklapt tot bij de kolommen.
function TabelKnoop({tabel}) {
  return (
    <details className={styles.knoop}>
      <summary className={styles.knoopKop}>
        <span className={styles.icoonTabel} aria-hidden="true">
          {tabel.soort === 'view' ? '◫' : '▦'}
        </span>
        <span className={styles.knoopNaam}>{tabel.naam}</span>
        <span className={styles.knoopTelling}>
          {tabel.kolommen.length} veld{tabel.kolommen.length === 1 ? '' : 'en'}
        </span>
      </summary>
      <ul className={styles.velden}>
        {tabel.kolommen.map((k) => (
          <li key={k.naam} className={styles.veld}>
            <span className={styles.icoonVeld} aria-hidden="true">
              {k.sleutel ? '🔑' : '◦'}
            </span>
            <span className={styles.veldNaam}>{k.naam}</span>
            <span className={styles.veldType}>{k.type || 'geen type'}</span>
            {k.verplicht && <span className={styles.veldVlag}>NOT NULL</span>}
            {k.sleutel && <span className={styles.veldVlag}>PRIMARY KEY</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}

const STATUSTEKEN = {ok: '✓', fout: '✗', overgeslagen: '–', genegeerd: '–'};

export default function SqlSandbox({
  labo,
  leeg = false,
  groep,
  start = '',
  placeholder = 'Typ hier je SQL en klik op Uitvoeren...',
  children,
}) {
  const schemaUrl = useBaseUrl(`/sandbox/labo-${labo}.sql`);

  // Begininhoud voor de editor: expliciete start-prop, anders een SQL-blok dat als
  // children is meegegeven (bv. voorgevulde debug-scripts om te verbeteren).
  const kinderenTekst = Array.isArray(children) ? children.join('') : children;
  const beginTekst = start || (typeof kinderenTekst === 'string' ? kinderenTekst : '');

  const wrapRef = useRef(null);
  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const voerUitRef = useRef(() => {});
  const dbRef = useRef(null);
  const bouwBelofteRef = useRef(null);
  const statusRef = useRef('leeg');
  const aceGestartRef = useRef(false);
  const textareaRef = useRef(null);
  const themaObsRef = useRef(null);

  const [status, setStatus] = useState('leeg'); // leeg | laden | klaar | fout
  const [aceKlaar, setAceKlaar] = useState(false);
  const [initFout, setInitFout] = useState('');
  const [query, setQuery] = useState(beginTekst);
  const [uitvoeringen, setUitvoeringen] = useState(null); // feedback per statement
  const [melding, setMelding] = useState('');
  const [structuur, setStructuur] = useState(null); // tabellen/views met hun kolommen
  const [databanken, setDatabanken] = useState([]); // namen uit CREATE DATABASE
  const [schemaOpen, setSchemaOpen] = useState(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Databank lui opbouwen (pas bij eerste gebruik). Bij een "groep" wordt de databank
  // gedeeld door alle sandboxes met dezelfde groep (ze werken op dezelfde tabellen).
  const zorgDatabank = useCallback(() => {
    if (groep) {
      const entry = gedeeldeDbs.get(groep);
      if (entry?.db) {
        dbRef.current = entry.db;
        return Promise.resolve(entry.db);
      }
      if (entry?.belofte) return entry.belofte;
      setStatus('laden');
      const belofte = bouwLegeOfDataDb(leeg, schemaUrl)
        .then((db) => {
          gedeeldeDbs.set(groep, {db});
          dbRef.current = db;
          setStatus('klaar');
          return db;
        })
        .catch((e) => {
          gedeeldeDbs.delete(groep);
          setInitFout(String(e.message || e));
          setStatus('fout');
          throw e;
        });
      gedeeldeDbs.set(groep, {belofte});
      return belofte;
    }
    if (dbRef.current) return Promise.resolve(dbRef.current);
    if (bouwBelofteRef.current) return bouwBelofteRef.current;
    setStatus('laden');
    bouwBelofteRef.current = bouwLegeOfDataDb(leeg, schemaUrl)
      .then((db) => {
        dbRef.current = db;
        setStatus('klaar');
        return db;
      })
      .catch((e) => {
        bouwBelofteRef.current = null;
        setInitFout(String(e.message || e));
        setStatus('fout');
        throw e;
      });
    return bouwBelofteRef.current;
  }, [schemaUrl, leeg, groep]);

  const huidigeTekst = useCallback(() => {
    return editorRef.current ? editorRef.current.getValue() : query;
  }, [query]);

  // Het script statement per statement uitvoeren, met feedback per statement.
  // Bij een fout stopt het script daar (zoals bij een script in Workbench); de rest
  // wordt getoond als "niet uitgevoerd", zodat duidelijk is waar het misliep.
  const voerUit = useCallback(async () => {
    setMelding('');
    let db;
    try {
      db = await zorgDatabank();
    } catch {
      return; // initFout is al gezet
    }

    const statements = splitsStatements(huidigeTekst());
    if (statements.length === 0) {
      setUitvoeringen(null);
      setMelding('Er staat nog geen SQL in de editor.');
      return;
    }

    const lijst = [];
    const nieuweDatabanken = [];
    let gestopt = false;
    statements.forEach((stmt, index) => {
      const info = beschrijfStatement(stmt.sql);
      if (info.soort === 'CREATE' && info.ding === 'DATABASE' && info.object) {
        nieuweDatabanken.push(info.object);
      }
      const basis = {
        nr: index + 1,
        regel: stmt.regel,
        label: info.label,
        voorbeeld: voorbeeldRegel(stmt.sql),
      };
      if (gestopt) {
        lijst.push({
          ...basis,
          toestand: 'overgeslagen',
          melding: 'Niet uitgevoerd: het script stopte bij de fout hierboven.',
        });
        return;
      }
      const vertaald = vertaalStudentSql(stmt.sql).trim();
      if (!vertaald || !zonderCommentaar(vertaald)) {
        let waarom = 'Alleen commentaar, niets uit te voeren.';
        if (zonderCommentaar(stmt.sql)) {
          waarom =
            info.soort === 'USE' || info.ding === 'DATABASE'
              ? 'Overgeslagen: de sandbox werkt met een databank, je tabellen komen daar automatisch in terecht. Op de MySQL-server heb je dit statement wel nodig.'
              : 'Overgeslagen: een MySQL-serverinstructie die de browserdatabank niet nodig heeft.';
        }
        lijst.push({...basis, toestand: 'genegeerd', melding: waarom});
        return;
      }
      try {
        const res = db.exec(vertaald);
        const laatste = res && res.length ? res[res.length - 1] : null;
        if (laatste) {
          const aantal = laatste.values.length;
          lijst.push({
            ...basis,
            toestand: 'ok',
            melding: `${aantal} rij${aantal === 1 ? '' : 'en'} opgehaald.`,
            resultaat: {
              kolommen: laatste.columns,
              rijen: laatste.values.slice(0, MAX_RIJEN),
              totaal: aantal,
            },
          });
        } else {
          const haaltOp = ['SELECT', 'WITH', 'VALUES', 'PRAGMA', 'EXPLAIN'].includes(info.soort);
          lijst.push({
            ...basis,
            toestand: 'ok',
            melding: haaltOp ? '0 rijen opgehaald.' : geluktMelding(info, db.getRowsModified()),
          });
        }
      } catch (e) {
        gestopt = true;
        lijst.push({...basis, toestand: 'fout', melding: String(e.message || e)});
      }
    });

    // Autocompletie bijwerken met (eventueel nieuw aangemaakte) tabellen.
    if (editorRef.current) editorRef.current.$dbSchema = schemaUitDb(db);
    setUitvoeringen(lijst);
    // Structuur van de databank bijwerken: zo ziet de student meteen welke tabellen
    // en kolommen er nu bestaan.
    setStructuur(leesStructuur(db));
    if (nieuweDatabanken.length) {
      setDatabanken((vorige) => [...new Set([...vorige, ...nieuweDatabanken])]);
    }
  }, [zorgDatabank, huidigeTekst]);

  // Structuur ophalen wanneer de student het schemapaneel openklapt.
  const toonSchema = useCallback(
    (open) => {
      setSchemaOpen(open);
      if (!open) return;
      zorgDatabank().then(
        (db) => setStructuur(leesStructuur(db)),
        () => {},
      );
    },
    [zorgDatabank],
  );

  useEffect(() => {
    voerUitRef.current = voerUit;
  }, [voerUit]);

  // Ace-editor lui opzetten bij eerste interactie met de sandbox (hover of focus).
  // (Niet via IntersectionObserver: dat vuurt niet in omgevingen zonder viewporthoogte.)
  const mountAce = useCallback(() => {
    if (aceGestartRef.current) return;
    aceGestartRef.current = true;
    const wasGefocust = textareaRef.current && document.activeElement === textareaRef.current;
    const beginwaarde = textareaRef.current ? textareaRef.current.value : query;
    laadAce()
      .then((ace) => {
        if (!hostRef.current || editorRef.current) return;
        registreerSchemaCompleter(ace);
        const editor = ace.edit(hostRef.current);
        editor.setTheme(donkerThema() ? ACE_THEMA_DONKER : ACE_THEMA_LICHT);
        editor.session.setMode('ace/mode/sql');
        editor.setValue(beginwaarde, -1);
        editor.setOptions({
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          fontSize: '0.9rem',
          minLines: 5,
          maxLines: 20,
          showPrintMargin: false,
          useWorker: false,
          placeholder,
        });
        editor.commands.addCommand({
          name: 'sandboxRun',
          bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
          exec: () => voerUitRef.current(),
        });
        editor.session.on('change', () => setQuery(editor.getValue()));
        editor.on('focus', () => {
          if (!dbRef.current && statusRef.current !== 'fout') zorgDatabank().catch(() => {});
        });
        editorRef.current = editor;

        // Schema voor autocompletie inladen (bij een dataset-labo). Bij een lege
        // databank leert de autocompletie de tabellen zodra de student ze aanmaakt.
        if (!leeg) {
          haalSchemaTekst(schemaUrl)
            .then((t) => {
              if (editorRef.current) editorRef.current.$dbSchema = ontleedSchema(t);
            })
            .catch(() => {});
        }

        // Thema meeschakelen met Docusaurus (licht/donker).
        themaObsRef.current = new MutationObserver(() => {
          editor.setTheme(donkerThema() ? ACE_THEMA_DONKER : ACE_THEMA_LICHT);
        });
        themaObsRef.current.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });

        setAceKlaar(true);
        if (wasGefocust) {
          editor.focus();
          editor.navigateFileEnd();
        }
      })
      .catch(() => {
        // Ace kon niet laden: de textarea-fallback blijft werken; later opnieuw proberen mag.
        aceGestartRef.current = false;
      });
  }, [query, schemaUrl, placeholder, zorgDatabank, leeg]);

  // Opruimen bij unmount.
  useEffect(() => {
    return () => {
      themaObsRef.current?.disconnect();
      try {
        editorRef.current?.destroy();
      } catch {
        /* stil */
      }
      editorRef.current = null;
    };
  }, []);

  const herstel = useCallback(() => {
    setUitvoeringen(null);
    setMelding('');
    setStructuur(null);
    setDatabanken([]);
    try {
      dbRef.current?.close();
    } catch {
      /* stil */
    }
    dbRef.current = null;
    bouwBelofteRef.current = null;
    // Bij een gedeelde groep ook de gedeelde databank wissen (reset voor alle schermen).
    if (groep) gedeeldeDbs.delete(groep);
    zorgDatabank().then(
      (db) => {
        setMelding('Databank hersteld naar de begintoestand.');
        if (schemaOpen) setStructuur(leesStructuur(db));
      },
      () => {},
    );
  }, [zorgDatabank, groep, schemaOpen]);

  function bijToets(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      voerUit();
    }
  }

  const tabellen = (structuur || []).filter((o) => o.soort === 'table');
  const views = (structuur || []).filter((o) => o.soort === 'view');

  // Korte samenvatting boven de feedbackblokken.
  let samenvatting = null;
  if (uitvoeringen && uitvoeringen.length) {
    const totaal = uitvoeringen.length;
    const foutIndex = uitvoeringen.findIndex((u) => u.toestand === 'fout');
    const gelukt = uitvoeringen.filter((u) => u.toestand === 'ok').length;
    const overgeslagen = uitvoeringen.filter((u) => u.toestand === 'overgeslagen').length;
    const genegeerd = uitvoeringen.filter((u) => u.toestand === 'genegeerd').length;
    const staart = genegeerd ? ` (${genegeerd} overgeslagen)` : '';
    samenvatting =
      foutIndex === -1
        ? `${gelukt} statement${gelukt === 1 ? '' : 's'} uitgevoerd, alles gelukt.${staart}`
        : `Statement ${foutIndex + 1} van ${totaal} gaf een fout: ${gelukt} gelukt, ${overgeslagen} niet meer uitgevoerd.${staart}`;
  }

  return (
    <div className={styles.wrap} ref={wrapRef} onPointerEnter={mountAce}>
      <div className={styles.kop}>
        <span className={styles.badge}>SQL-sandbox</span>
        <span className={styles.subtiel}>
          {leeg
            ? 'draait in je browser (SQLite). De databank is nog leeg: maak zelf tabellen aan.'
            : 'draait in je browser (SQLite). De databank van dit labo is al ingeladen.'}
        </span>
      </div>

      <div ref={hostRef} className={styles.editorHost} hidden={!aceKlaar} />
      {!aceKlaar && (
        <textarea
          ref={textareaRef}
          className={styles.invoer}
          value={query}
          spellCheck={false}
          placeholder={placeholder}
          onFocus={() => {
            mountAce();
            if (!dbRef.current && statusRef.current !== 'fout') zorgDatabank().catch(() => {});
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={bijToets}
          aria-label="SQL-query"
        />
      )}

      <div className={styles.knoprij}>
        <button
          type="button"
          className={styles.knop}
          onClick={voerUit}
          disabled={status === 'laden'}
        >
          {status === 'laden' ? 'Databank laden...' : 'Uitvoeren'}
        </button>
        <button
          type="button"
          className={styles.knopLicht}
          onClick={herstel}
          disabled={status === 'laden' || status === 'leeg'}
        >
          Databank herstellen
        </button>
        <span className={styles.tip}>Tip: Ctrl+Enter om uit te voeren</span>
      </div>

      {status === 'fout' && (
        <p className={styles.fout}>Kon de sandbox niet starten: {initFout}</p>
      )}
      {melding && <p className={styles.melding}>{melding}</p>}

      {/* Schemaboom: openklikken zoals de navigator in Workbench. */}
      <details
        className={styles.schema}
        open={schemaOpen}
        onToggle={(e) => toonSchema(e.currentTarget.open)}
      >
        <summary className={styles.schemaKop}>
          Structuur van de databank
          {tabellen.length > 0 && (
            <span className={styles.schemaTelling}>
              {tabellen.length} tabel{tabellen.length === 1 ? '' : 'len'}
            </span>
          )}
        </summary>

        <div className={styles.boom}>
          <div className={styles.boomWortel}>
            <span className={styles.icoonDb} aria-hidden="true">
              ▤
            </span>
            {databanken.length ? databanken.join(', ') : 'sandbox'}
            <span className={styles.subtiel}>
              {' '}
              (de browsersandbox werkt met een databank; CREATE DATABASE en USE worden
              overgeslagen)
            </span>
          </div>

          {structuur === null && <p className={styles.stapMelding}>Structuur wordt opgehaald...</p>}

          {structuur !== null && tabellen.length === 0 && views.length === 0 && (
            <p className={styles.stapMelding}>
              Nog geen tabellen. Maak er een aan met CREATE TABLE en voer je script uit.
            </p>
          )}

          {tabellen.length > 0 && (
            <div className={styles.boomTak}>
              <div className={styles.boomGroep}>Tabellen ({tabellen.length})</div>
              {tabellen.map((t) => (
                <TabelKnoop key={t.naam} tabel={t} />
              ))}
            </div>
          )}

          {views.length > 0 && (
            <div className={styles.boomTak}>
              <div className={styles.boomGroep}>Views ({views.length})</div>
              {views.map((v) => (
                <TabelKnoop key={v.naam} tabel={v} />
              ))}
            </div>
          )}
        </div>
      </details>

      {samenvatting && <p className={styles.samenvatting}>{samenvatting}</p>}

      {uitvoeringen &&
        uitvoeringen.slice(0, MAX_BLOKKEN).map((u) => (
          <div key={u.nr} className={`${styles.stap} ${styles[`stap_${u.toestand}`]}`}>
            <div className={styles.stapKop}>
              <span className={styles.stapTeken} aria-hidden="true">
                {STATUSTEKEN[u.toestand]}
              </span>
              <span className={styles.stapTitel}>
                Statement {u.nr}: {u.label}
              </span>
              <span className={styles.stapRegel}>regel {u.regel}</span>
            </div>
            <code className={styles.stapSql}>{u.voorbeeld}</code>
            <p className={u.toestand === 'fout' ? styles.stapFout : styles.stapMelding}>
              {u.toestand === 'fout' ? `Fout: ${u.melding}` : u.melding}
            </p>
            {u.resultaat && <Resultaattabel resultaat={u.resultaat} />}
          </div>
        ))}

      {uitvoeringen && uitvoeringen.length > MAX_BLOKKEN && (
        <p className={styles.telling}>
          Nog {uitvoeringen.length - MAX_BLOKKEN} statement
          {uitvoeringen.length - MAX_BLOKKEN === 1 ? '' : 's'} uitgevoerd (niet getoond).
        </p>
      )}
    </div>
  );
}
