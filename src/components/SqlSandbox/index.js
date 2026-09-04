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

function donkerThema() {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}
const ACE_THEMA_LICHT = 'ace/theme/textmate';
const ACE_THEMA_DONKER = 'ace/theme/tomorrow_night';

export default function SqlSandbox({
  labo,
  leeg = false,
  start = '',
  placeholder = 'Typ hier je SQL en klik op Uitvoeren...',
}) {
  const schemaUrl = useBaseUrl(`/sandbox/labo-${labo}.sql`);

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
  const [query, setQuery] = useState(start);
  const [resultaten, setResultaten] = useState(null);
  const [queryFout, setQueryFout] = useState('');
  const [melding, setMelding] = useState('');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Databank lui opbouwen (pas bij eerste gebruik).
  const zorgDatabank = useCallback(() => {
    if (dbRef.current) return Promise.resolve(dbRef.current);
    if (bouwBelofteRef.current) return bouwBelofteRef.current;
    setStatus('laden');
    bouwBelofteRef.current = (async () => {
      const SQL = await laadSqlJs();
      const db = new SQL.Database();
      if (!leeg) {
        const schemaTekst = await haalSchemaTekst(schemaUrl);
        db.run(schemaTekst);
      }
      dbRef.current = db;
      setStatus('klaar');
      return db;
    })().catch((e) => {
      bouwBelofteRef.current = null;
      setInitFout(String(e.message || e));
      setStatus('fout');
      throw e;
    });
    return bouwBelofteRef.current;
  }, [schemaUrl, leeg]);

  const huidigeTekst = useCallback(() => {
    return editorRef.current ? editorRef.current.getValue() : query;
  }, [query]);

  const voerUit = useCallback(async () => {
    setQueryFout('');
    setMelding('');
    let db;
    try {
      db = await zorgDatabank();
    } catch {
      return; // initFout is al gezet
    }
    try {
      const res = db.exec(vertaalStudentSql(huidigeTekst()));
      // Autocompletie bijwerken met (eventueel nieuw aangemaakte) tabellen.
      if (editorRef.current) editorRef.current.$dbSchema = schemaUitDb(db);
      if (!res || res.length === 0) {
        setResultaten(null);
        setMelding('Query uitgevoerd. Geen resultaten om te tonen.');
        return;
      }
      const laatste = res[res.length - 1];
      setResultaten({
        kolommen: laatste.columns,
        rijen: laatste.values.slice(0, MAX_RIJEN),
        totaal: laatste.values.length,
      });
    } catch (e) {
      setResultaten(null);
      setQueryFout(String(e.message || e));
    }
  }, [zorgDatabank, huidigeTekst]);

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
    setQueryFout('');
    setResultaten(null);
    setMelding('');
    try {
      dbRef.current?.close();
    } catch {
      /* stil */
    }
    dbRef.current = null;
    bouwBelofteRef.current = null;
    zorgDatabank().then(
      () => setMelding('Databank hersteld naar de begintoestand.'),
      () => {},
    );
  }, [zorgDatabank]);

  function bijToets(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      voerUit();
    }
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
      {queryFout && <p className={styles.fout}>Fout: {queryFout}</p>}
      {melding && <p className={styles.melding}>{melding}</p>}

      {resultaten && (
        <div className={styles.resultaatwrap}>
          <table className={styles.tabel}>
            <thead>
              <tr>
                {resultaten.kolommen.map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultaten.rijen.map((rij, i) => (
                <tr key={i}>
                  {rij.map((cel, j) => (
                    <td key={j}>{cel === null ? <em className={styles.nul}>NULL</em> : String(cel)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.telling}>
            {resultaten.totaal} rij{resultaten.totaal === 1 ? '' : 'en'}
            {resultaten.totaal > MAX_RIJEN ? ` (eerste ${MAX_RIJEN} getoond)` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
