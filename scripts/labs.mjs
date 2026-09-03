#!/usr/bin/env node
// Bouwt de "Oefeningen"-sectie (labo's) op uit de aangeleverde bronbestanden.
//
// Bron: de labo-bestanden die in scratchpad/labs zijn uitgepakt (zips met opgave-HTML +
// calibratie/debug-SQL) en de losse opgave-PDF's. Omdat de bron een mengelmoes is
// (zip/PDF/enkel-SQL/ontbrekend) hernummeren we tot een gesloten reeks; het oorspronkelijke
// labo-nummer staat als ondertitel op elke pagina.
//
// - HTML-opgaven -> markdown (koppen/paragrafen/lijsten/code); tabellen blijven als HTML
//   (renderen prima met markdown.format:'detect'); afbeeldingen worden weggelaten.
// - PDF-opgaven -> tekst via `pdftotext -layout`, dan best-effort naar markdown.
// - SQL/mwb-bestanden -> downloads onder static/downloads/oefeningen/labo-NN/.
//
// Draai vanuit de repo-root:  node scripts/labs.mjs
// Vereist: LABS_SRC (map met uitgepakte labo's) en DL (map met de PDF's). Zie CONFIG.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// ---- CONFIG: pas deze paden aan je omgeving aan --------------------------------
const LABS_SRC = process.env.LABS_SRC
  || 'C:/Users/p103141/AppData/Local/Temp/claude/C--Prive/45983b23-b7d7-433a-8637-b878074f64cd/scratchpad/labs';
const DL = process.env.LABS_DL || 'C:/Users/p103141/Downloads';
const LESF = process.env.LABS_LES
  || 'C:/Users/p103141/AppData/Local/Temp/claude/C--Prive/45983b23-b7d7-433a-8637-b878074f64cd/scratchpad/lesfiles';

// SQL-bestanden tot deze grootte worden inline in een codeblok gezet (kopieerbaar uit de
// cursus); grotere dumps blijven downloads.
const INLINE_MAX = 30000;

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'oefeningen');
const DLOUT = path.join(ROOT, 'static', 'downloads', 'oefeningen');

// Gesloten reeks; `orig` = oorspronkelijke bron/labo-nummer (ondertitel).
const MANIFEST = [
  { orig: 'Labo 01', html: { dir: 'l01' } },
  { orig: 'Labo 02', html: { dir: 'l02' } },
  { orig: 'Labo 03', html: { dir: 'l03' } },
  { orig: 'Labo 04', html: { dir: 'l04' } },
  { orig: 'Labo 05', html: { dir: 'l05' } },
  { orig: 'Labo 06', html: { dir: 'l06' } },
  // Labo 07 & 08 = het apTunes-project (normalisatie). De opgaven staan in de cursus;
  // hier leveren we enkel het bijhorende calibratiescript + een link naar de sectie.
  {
    orig: 'Labo 07',
    aptunes: {
      title: 'apTunes - normalisatie',
      anchor: 'normalisatie-van-de-aptunes-databank',
      calibr: path.join(DL, 'Labo 07 Calibratie.sql'),
    },
    extra: [path.join(LESF, 'Les07', 'Les 07.sql')],
  },
  {
    orig: 'Labo 08',
    aptunes: {
      title: 'apTunes - veel-op-veel relaties en joins',
      anchor: 'veel-op-veel-m-op-n-relaties',
      calibr: path.join(DL, 'Labo 08 Calibratie.sql'),
    },
  },
  { orig: 'Labo 09', html: { dir: 'l09' } },
  { orig: 'Labo 10', html: { dir: 'l10' } },
  { orig: 'Labo 11', html: { dir: 'l11' } },
  { orig: 'Opdrachten views', html: { dir: 'lviews' } },
  { orig: 'Opdrachten indexeren', html: { files: [path.join(DL, 'opdrachten.md.html')] } },
  { orig: 'Labo 14', html: { dir: 'l14op' } },
  { orig: 'Labo 15', pdf: 'Opgaven Labo 15.pdf', calibr: path.join(DL, 'calibratie labo 15.txt') },
  {
    orig: 'Labo 16', pdf: 'Opgave Labo 16.pdf',
    extra: [path.join(LESF, 'Les16', 'Les 16 Calibratie.sql'), path.join(LESF, 'Les16', 'Les 16.sql')],
  },
  { orig: 'Labo 17', html: { dir: 'l17' } },
  { orig: 'Labo 18', pdf: 'Labo 18 - opgaven.pdf', calibr: path.join(DL, 'tennis_calibratiescript.sql') },
  { orig: 'Labo 19', html: { dir: 'l19' }, calibr: path.join(DL, 'Labo19 Calibratie.sql') },
  {
    orig: 'Labo 20', pdf: 'Labo 20 opgave.pdf',
    extra: [path.join(LESF, 'Les20', 'Les 20 Calibratie.sql'), path.join(LESF, 'Les20', 'Les 20.sql')],
  },
  {
    orig: 'Labo 21', pdf: 'Labo 21 - herhalingsoefeningen.pdf',
    extra: [path.join(LESF, 'Les21', 'Les 21.sql')],
  },
];

// ---- helpers ---------------------------------------------------------------
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENT[m]);

function naturalSort(a, b) {
  return a.replace(/\d+/g, (n) => n.padStart(6, '0')).localeCompare(
    b.replace(/\d+/g, (n) => n.padStart(6, '0')));
}

function inlineMd(html) {
  let s = html;
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, h, t) => `[${stripTags(t)}](${h})`);
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, x) => `**${stripTags(x)}**`);
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, x) => `_${stripTags(x)}_`);
  s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_m, x) => '`' + stripTags(x) + '`');
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = stripTags(s);
  s = decode(s).replace(/[ \t]+/g, ' ').trim();
  return s;
}
const stripTags = (s) => s.replace(/<[^>]+>/g, '');

// Zet de content van één opgave-HTML om naar markdown.
function htmlToMd(raw) {
  let s = raw;
  s = s.replace(/<title\b[\s\S]*?<\/title>/gi, ''); // titel-tekst (bv. "Oefening 01-01.md") weg
  s = s.replace(/<!DOCTYPE[^>]*>/gi, '').replace(/<\/?(html|head|body|meta|link)[^>]*>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');

  // Tabellen beschermen (als ruwe HTML behouden, entiteiten in cellen normaliseren).
  const tables = [];
  s = s.replace(/<table\b[\s\S]*?<\/table>/gi, (m) => {
    const clean = m.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    tables.push(clean);
    return `\n\n@@TABLE${tables.length - 1}@@\n\n`;
  });

  // <pre> -> fenced code
  s = s.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_m, x) => {
    const code = decode(stripTags(x)).replace(/^\n+|\n+$/g, '');
    return `\n\n\`\`\`sql\n${code}\n\`\`\`\n\n`;
  });

  // koppen
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_m, x) => `\n\n## ${inlineMd(x)}\n\n`);
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_m, x) => `\n\n### ${inlineMd(x)}\n\n`);
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_m, x) => `\n\n#### ${inlineMd(x)}\n\n`);

  // lijsten
  s = s.replace(/<[ou]l\b[^>]*>([\s\S]*?)<\/[ou]l>/gi, (_m, inner) => {
    const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((mm) => `- ${inlineMd(mm[1])}`);
    return '\n\n' + items.join('\n') + '\n\n';
  });

  // afbeeldingen weglaten; als een <p> enkel een afbeelding bevat -> notitie
  s = s.replace(/<p\b[^>]*>\s*(<img\b[^>]*>)\s*<\/p>/gi, '\n\n_(Bijhorende afbeelding niet beschikbaar in het bronmateriaal.)_\n\n');
  s = s.replace(/<img\b[^>]*>/gi, '');

  // paragrafen
  s = s.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_m, x) => `\n\n${inlineMd(x)}\n\n`);

  // rest strippen
  s = stripTags(s);
  s = decode(s);

  // tabellen terugzetten
  s = s.replace(/@@TABLE(\d+)@@/g, (_m, i) => tables[+i]);

  s = s.replace(/^[ \t]+$/gm, '');       // whitespace-only regels leegmaken
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

// Best-effort PDF -> markdown
function pdfToMd(pdfPath) {
  const txt = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', pdfPath, '-'], { encoding: 'utf8' });
  const lines = txt.replace(/\r/g, '').split('\n');
  // backtick+quote uit PDF (`naam') normaliseren naar `naam`
  const fixTicks = (s) => s.replace(/`([^`'\n]+)'/g, '`$1`');

  // Zet een groep ruwe regels om naar markdown: paragrafen (gescheiden door lege regels)
  // en opsommingen (• -> "- ", ingesprongen "o " -> "  - "), met continuatieregels.
  const renderBlock = (rawLines) => {
    const blocks = [];
    let para = [];
    let item = null;
    const clean = (s) => fixTicks(s).replace(/\s{2,}/g, ' ').trim();
    const flushPara = () => { if (para.length) { blocks.push({ t: 'p', s: clean(para.join(' ')) }); para = []; } };
    const flushItem = () => { if (item) { blocks.push({ t: 'li', s: item.pad + clean(item.text) }); item = null; } };
    for (const raw of rawLines) {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) { flushItem(); flushPara(); continue; }
      const b = line.match(/^\s*[•●▪·*]\s+(.*)$/);
      const sb = line.match(/^\s{2,}o\s+(.*)$/);
      if (b) { flushItem(); flushPara(); item = { pad: '- ', text: b[1] }; }
      else if (sb) { flushItem(); flushPara(); item = { pad: '  - ', text: sb[1] }; }
      else if (item) { item.text += ' ' + line.trim(); }
      else { para.push(line.trim()); }
    }
    flushItem(); flushPara();
    let out = '', prev = null;
    for (const bl of blocks) {
      if (out) out += (prev === 'li' && bl.t === 'li') ? '\n' : '\n\n';
      out += bl.s; prev = bl.t;
    }
    return out.trim();
  };

  const introLines = [];
  const items = []; // {num, lines:[]}
  let cur = null;
  let started = false;
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const m = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (m) {
      started = true;
      if (cur) items.push(cur);
      cur = { num: m[1], lines: [m[2]] };
    } else if (cur) {
      cur.lines.push(line);
    } else if (started === false && !/^\s*OPGAVE[N]?\s+LABO/i.test(line)) {
      introLines.push(line); // incl. lege regels (voor paragraaf-detectie)
    }
  }
  if (cur) items.push(cur);

  let out = '';
  const intro = renderBlock(introLines);
  if (intro) out += intro + '\n\n';
  for (const it of items) {
    const splitIdx = it.lines.findIndex((l) => /output\s*:/i.test(l));
    const desc = splitIdx >= 0 ? it.lines.slice(0, splitIdx + 1) : it.lines;
    const code = splitIdx >= 0 ? it.lines.slice(splitIdx + 1) : [];
    out += `## Opgave ${it.num}\n\n${renderBlock(desc)}\n\n`;
    const codeTxt = code.join('\n').replace(/^\n+|\n+$/g, '');
    if (codeTxt.trim()) out += '```\n' + codeTxt.replace(/[ \t]+$/gm, '') + '\n```\n\n';
  }
  return out.trim();
}

// recursief alle bestanden onder dir opsommen (zips pakken soms in een subfolder uit)
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
function collectHtmlFiles(html) {
  if (html.files) return html.files;
  return walk(path.join(LABS_SRC, html.dir))
    .filter((f) => /\.html?$/i.test(f))
    // "algemene-instructies" e.d. eerst, daarna natuurlijke volgorde
    .sort((a, b) => {
      const ia = /instructie|algemene/i.test(path.basename(a)) ? 0 : 1;
      const ib = /instructie|algemene/i.test(path.basename(b)) ? 0 : 1;
      return ia - ib || naturalSort(path.basename(a), path.basename(b));
    });
}
function collectAssets(html) {
  if (!html || !html.dir) return [];
  return walk(path.join(LABS_SRC, html.dir)).filter((f) => /\.(sql|mwb|pdf)$/i.test(f));
}

// ---- main ------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
// oude labo-pagina's wissen (intro.md behouden), assets opnieuw
for (const f of fs.readdirSync(OUT)) if (/^labo-\d+\.md$/.test(f)) fs.rmSync(path.join(OUT, f));
fs.rmSync(DLOUT, { recursive: true, force: true });

const overview = [];
const gaps = [];

MANIFEST.forEach((entry, idx) => {
  const seq = String(idx + 1).padStart(2, '0');
  const slug = `labo-${seq}`;
  const title = `Labo ${seq}`;
  let body = '';

  const assetPaths = []; // bronpaden die als download meegaan

  if (entry.html) {
    const files = collectHtmlFiles(entry.html);
    body = files.map((f) => htmlToMd(fs.readFileSync(f, 'utf8'))).join('\n\n');
    assetPaths.push(...collectAssets(entry.html));
  } else if (entry.aptunes) {
    const ap = entry.aptunes;
    body = `Dit labo werkt rond het **apTunes-project**. De opgaven staan in de cursus, `
      + `in de sectie [${ap.title}](/docs/my-sql/aptunes#${ap.anchor}).\n\n`
      + `Voer eerst het bijhorende calibratiescript hieronder uit voor je aan de opgaven begint.`;
    assetPaths.push(ap.calibr);
  } else if (entry.pdf) {
    try {
      body = pdfToMd(path.join(DL, entry.pdf));
      gaps.push(`${title} (${entry.orig}): uit PDF geconverteerd - controleer opmaak/voorbeeld-output.`);
    } catch (e) {
      body = '_(Kon PDF niet automatisch omzetten.)_';
      gaps.push(`${title} (${entry.orig}): PDF-conversie faalde: ${e.message}`);
    }
  }

  // externe scripts (losse calibratie uit Downloads, Les-materiaal)
  if (entry.calibr) assetPaths.push(entry.calibr);
  if (entry.extra) assetPaths.push(...entry.extra);

  // Kleine SQL -> inline codeblok; grote dumps/binaire bestanden -> download.
  const inlined = [];
  const downloads = [];
  let dstMade = false;
  const ensureDst = () => {
    const d = path.join(DLOUT, slug);
    if (!dstMade) { fs.mkdirSync(d, { recursive: true }); dstMade = true; }
    return d;
  };
  for (const a of assetPaths) {
    let name = path.basename(a).replace(/\s+/g, '_');
    if (/\.txt$/i.test(name)) name = name.replace(/\.txt$/i, '.sql');
    const isSql = /\.(sql|txt)$/i.test(a);
    let size = Infinity;
    try { size = fs.statSync(a).size; } catch {}
    if (isSql && size <= INLINE_MAX) {
      const code = fs.readFileSync(a, 'utf8').replace(/\r/g, '').replace(/```/g, "'''").trimEnd();
      inlined.push(`### ${name}\n\n\`\`\`sql\n${code}\n\`\`\``);
    } else {
      fs.copyFileSync(a, path.join(ensureDst(), name));
      downloads.push(`- [${name}](/downloads/oefeningen/${slug}/${name})`);
    }
  }
  if (inlined.length) body += `\n\n## Scripts\n\n${inlined.join('\n\n')}\n`;
  if (downloads.length) body += `\n\n## Bestanden\n\n${downloads.join('\n')}\n`;

  const fm = [
    '---',
    `title: ${title}`,
    `sidebar_position: ${idx + 2}`, // 1 = intro
    '---',
    '',
    `# ${title}`,
    '',
    `_Bron: ${entry.orig}._`,
    '',
    body,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `${slug}.md`), fm);
  overview.push(`- [${title}](${slug}.md) — _${entry.orig}_`);
});

// intro.md opnieuw met volledig overzicht
const intro = `---
title: Oefeningen
sidebar_position: 1
slug: /
---

# Oefeningen (labo's)

Bij deze cursus horen **labo's**: reeksen praktische oefeningen waarmee je de leerstof uit de
cursus inoefent. De labo's zijn hernummerd tot een doorlopende reeks; het oorspronkelijke
labo-nummer staat als bron bovenaan elke pagina.

## Werkwijze

1. **Voer het calibratiescript uit** dat bij het labo hoort (waar aanwezig): kleine scripts
   staan onderaan onder "Scripts" om te kopiëren, grote onder "Bestanden" om te downloaden.
   Dat script maakt de databank en tabellen aan en vult ze met voorbeelddata.
2. Maak de oefeningen in volgorde. Bij elke oefening staat wat gevraagd wordt en (waar nuttig)
   een voorbeeld van de verwachte output.
3. **Sla je oplossingsscripts op** volgens de gevraagde bestandsnaam.
4. Voer je code uit en controleer de output. Loopt iets mis, lees de foutmelding en los het op.

:::info
Wordt er een stored procedure gevraagd, bewaar dan zowel het script dat de stored procedure
**aanmaakt** als een script dat ze **oproept** om de werking te demonstreren.
:::

## Overzicht

${overview.join('\n')}
`;
fs.writeFileSync(path.join(OUT, 'intro.md'), intro);

console.log(`Klaar. ${MANIFEST.length} labo-pagina's geschreven onder oefeningen/.`);
if (gaps.length) {
  console.log('\nAandachtspunten:');
  gaps.forEach((g) => console.log('  - ' + g));
}
