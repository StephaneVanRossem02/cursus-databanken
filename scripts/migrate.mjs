#!/usr/bin/env node
// GitBook -> Docusaurus migratiescript voor de cursus "Databanken".
//
// Bron: https://apwt.gitbook.io/databanken  (publiek gepubliceerde GitBook-site)
// - Paginalijst + volgorde uit /llms.txt
// - Per pagina de .md-export (exacte tekst + codeblokken)
// - Afbeeldingen en bijlagen worden uit de server-gerenderde HTML gehaald
//   (de .md gebruikt niet-resolveerbare /files/<id>-verwijzingen; de echte
//    URL's + originele bestandsnamen staan in de gerenderde pagina en worden
//    positioneel gemapt op de /files/-verwijzingen in de .md).
//
// Draai vanuit de repo-root:  node scripts/migrate.mjs
//
// Idempotent: overschrijft docs/ (de cursusinhoud) en de assets telkens opnieuw.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://apwt.gitbook.io/databanken';
const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const IMG_DIR = path.join(ROOT, 'static', 'img', 'databanken');
const FILE_DIR = path.join(ROOT, 'static', 'downloads', 'databanken');

// Labels van GitBook-groepen die geen eigen pagina hebben (uit de nav gehaald).
const GROUP_LABELS = {
  'databanken': 'Databanken',
  'my-sql': '(My)SQL',
  'pro-geen-leerstof-en-of-in-opbouw': 'PRO (GEEN LEERSTOF EN/OF IN OPBOUW)',
};

const UA = { headers: { 'user-agent': 'Mozilla/5.0 (databanken-migration)' } };

async function fetchText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, UA);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      if (i === tries - 1) throw new Error(`fetchText faalde voor ${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}
async function fetchBuf(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, UA);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) throw new Error(`fetchBuf faalde voor ${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// Eenvoudige concurrency-limiter.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---- 1. Index parsen -------------------------------------------------------
function parseIndex(txt) {
  const pages = [];
  for (const line of txt.split('\n')) {
    const m = line.match(
      /^- \[([^\]]*)\]\((https:\/\/apwt\.gitbook\.io\/databanken\/([^)]*?)\.md)\)/,
    );
    if (m) pages.push({ title: m[1], url: m[2], slug: m[3] });
  }
  return pages;
}

// ---- Asset-helpers ---------------------------------------------------------
function decodedName(cdnUrl) {
  // filename = deel na de laatste %2F (of /) voor de query
  const noQuery = cdnUrl.split('?')[0];
  const parts = noQuery.split(/%2F|\//);
  let name = parts[parts.length - 1];
  try { name = decodeURIComponent(name); } catch {}
  return name.replace(/[^A-Za-z0-9._-]+/g, '_');
}

// Haal uit gerenderde HTML de content-afbeeldingen en de bijlagen, in documentvolgorde.
// - Afbeeldingen = enkel de echte <img>-tags met "uploads" in de src (via ~gitbook/image).
//   Dat sluit chrome (logo/iconen op collections-pad) en de ~3x preload/srcset-ruis uit,
//   en geeft precies evenveel afbeeldingen als /files/-verwijzingen in de .md.
// - Bijlagen = directe href's naar de files-CDN (met "uploads"), tot het sluitende quote
//   (de download-URL kan een extra &token=... na alt=media bevatten).
function extractAssets(html) {
  const images = [];
  const files = [];
  const collapse = (arr, v) => { if (arr[arr.length - 1] !== v) arr.push(v); };
  let m;

  const imgTagRe = /<img\b[^>]*>/g;
  while ((m = imgTagRe.exec(html))) {
    const tag = m[0];
    const src = /src="([^"]*)"/.exec(tag);
    if (!src || !src[1].includes('uploads') || !src[1].includes('~gitbook/image')) continue;
    const u = /url=([^"&]+)/.exec(src[1]);
    if (!u) continue;
    let dec;
    try { dec = decodeURIComponent(u[1]); } catch { continue; }
    images.push(dec); // per <img>-tag exact 1x, volgorde behouden (ook herhalingen)
  }

  const hrefRe = /href="(https:\/\/[0-9]+-files\.gitbook\.io\/[^"]*?uploads[^"]*?)"/g;
  while ((m = hrefRe.exec(html))) {
    collapse(files, m[1].replace(/&amp;/g, '&'));
  }
  return { images, files };
}

// ---- 2. Conversie GitBook -> Docusaurus ------------------------------------
function stripLeadNote(md) {
  const lines = md.split('\n');
  // verwijder de vaste blockquote-noot bovenaan elke .md-export
  while (lines.length && (lines[0].trim() === '' ||
        (lines[0].startsWith('>') && /llms\.txt|Markdown versions|available as/i.test(lines[0])))) {
    if (lines[0].startsWith('>')) { lines.shift(); continue; }
    if (lines[0].trim() === '' && lines.length > 1 && lines[1].startsWith('>')) { lines.shift(); continue; }
    break;
  }
  // resterende lege regels vooraan weg
  while (lines.length && lines[0].trim() === '') lines.shift();
  return lines.join('\n');
}

function convertHints(md) {
  md = md
    .replace(/\{%\s*hint\s+style="info"\s*%\}/g, ':::info')
    .replace(/\{%\s*hint\s+style="success"\s*%\}/g, ':::tip')
    .replace(/\{%\s*hint\s+style="warning"\s*%\}/g, ':::warning')
    .replace(/\{%\s*hint\s+style="danger"\s*%\}/g, ':::danger')
    .replace(/\{%\s*endhint\s*%\}/g, ':::');
  // zorg voor lege regels rond admonition-openers en -sluiters
  const lines = md.split('\n');
  const out = [];
  const isOpen = (l) => /^:::(info|tip|warning|danger)\s*$/.test(l.trim());
  const isClose = (l) => l.trim() === ':::';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isOpen(l.trim())) {
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      out.push(l.trim());
    } else if (isClose(l)) {
      out.push(':::');
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
    } else {
      out.push(l);
    }
  }
  return out.join('\n');
}

function yamlQuote(s) {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// ---- main ------------------------------------------------------------------
async function main() {
  console.log('Index ophalen...');
  const idxTxt = await fetchText(`${BASE}/llms.txt`);
  const pages = parseIndex(idxTxt);
  console.log(`  ${pages.length} pagina's gevonden.`);

  const slugs = new Set(pages.map((p) => p.slug));
  const orderOf = new Map(pages.map((p, i) => [p.slug, i + 1]));
  const titleOf = new Map(pages.map((p) => [p.slug, p.title]));
  const hasChildren = (slug) => [...slugs].some((s) => s.startsWith(slug + '/'));

  // schone lei voor docs/ en assets
  fs.rmSync(DOCS, { recursive: true, force: true });
  fs.mkdirSync(DOCS, { recursive: true });
  fs.rmSync(IMG_DIR, { recursive: true, force: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.rmSync(FILE_DIR, { recursive: true, force: true });
  fs.mkdirSync(FILE_DIR, { recursive: true });

  // Alle .md ophalen
  console.log('Pagina-inhoud (.md) ophalen...');
  const mdTexts = await mapLimit(pages, 10, (p) => fetchText(`${p.url}`));

  // Voor pagina's met /files/ de gerenderde HTML ophalen en assets extraheren
  const needHtml = pages
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => /\/files\//.test(mdTexts[i]));
  console.log(`Assets: ${needHtml.length} pagina's met bijlagen/afbeeldingen...`);
  const assetsByIdx = new Map();
  await mapLimit(needHtml, 8, async ({ p, i }) => {
    const html = await fetchText(`${BASE}/${p.slug}`);
    assetsByIdx.set(i, extractAssets(html));
  });

  // Alle unieke asset-URL's downloaden (met naam-dedup per doel)
  const imgUrlToName = new Map();
  const fileUrlToName = new Map();
  const usedImgNames = new Map(); // basisnaam -> teller
  const usedFileNames = new Map();
  function uniqueName(map, base) {
    const n = (map.get(base) || 0) + 1;
    map.set(base, n);
    if (n === 1) return base;
    const dot = base.lastIndexOf('.');
    return dot > 0 ? `${base.slice(0, dot)}-${n}${base.slice(dot)}` : `${base}-${n}`;
  }
  const allImgUrls = new Set();
  const allFileUrls = new Set();
  for (const { images, files } of assetsByIdx.values()) {
    images.forEach((u) => allImgUrls.add(u));
    files.forEach((u) => allFileUrls.add(u));
  }
  // Zelfde onderliggende URL -> zelfde lokale bestandsnaam (dedup op inhoud).
  for (const u of allImgUrls) imgUrlToName.set(u, uniqueName(usedImgNames, decodedName(u)));
  for (const u of allFileUrls) fileUrlToName.set(u, uniqueName(usedFileNames, decodedName(u)));

  console.log(`  ${allImgUrls.size} afbeeldingen, ${allFileUrls.size} bijlagen downloaden...`);
  await mapLimit([...allImgUrls], 8, async (u) => {
    const buf = await fetchBuf(u);
    fs.writeFileSync(path.join(IMG_DIR, imgUrlToName.get(u)), buf);
  });
  await mapLimit([...allFileUrls], 8, async (u) => {
    const buf = await fetchBuf(u);
    fs.writeFileSync(path.join(FILE_DIR, fileUrlToName.get(u)), buf);
  });

  // Herschrijf de asset-maps zodat convert() met de lokale namen werkt:
  // convert verwacht arrays met (dezelfde) URL's; het maakt zelf de naam via decodedName.
  // Maar we willen de dedup-namen gebruiken -> vervang decodedName-resultaat.
  // Eenvoudiger: geef convert de reeds-herschreven lokale namen mee.
  const warnings = [];

  // Conversie + wegschrijven
  console.log('Converteren en schrijven...');
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const assets = assetsByIdx.get(i) || { images: [], files: [] };
    // map de URL-arrays naar lokale namen zodat convert de juiste naam invult
    const imgLocal = assets.images.map((u) => imgUrlToName.get(u));
    const fileLocal = assets.files.map((u) => fileUrlToName.get(u));

    // tel refs in de md
    const mdImgRefs = (mdTexts[i].match(/!\[[^\]]*\]\(\/files\/[A-Za-z0-9]+\)/g) || []).length
      + (mdTexts[i].match(/<img[^>]+src="\/files\/[A-Za-z0-9]+"/g) || []).length;
    const mdFileRefs = (mdTexts[i].match(/\{%\s*file\s+src="\/files\//g) || []).length;
    if (mdImgRefs !== imgLocal.length) {
      warnings.push(`  [afbeeldingen] ${p.slug}: md=${mdImgRefs} vs html=${imgLocal.length}`);
    }
    if (mdFileRefs !== fileLocal.length) {
      warnings.push(`  [bijlagen] ${p.slug}: md=${mdFileRefs} vs html=${fileLocal.length}`);
    }

    const { md } = convertWithLocalNames(mdTexts[i], imgLocal, fileLocal, p.slug, { slugs, hasChildren });

    // bestandslocatie bepalen
    const isParent = hasChildren(p.slug);
    const rel = isParent ? path.join(p.slug, 'index.md') : `${p.slug}.md`;
    const dest = path.join(DOCS, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const fm = ['---', `title: ${yamlQuote(p.title)}`, `sidebar_position: ${orderOf.get(p.slug)}`];
    if (p.slug === 'readme') fm.push('slug: /');
    fm.push('---', '', '');
    fs.writeFileSync(dest, fm.join('\n') + md);
  }

  // _category_.json per map
  console.log('Categorieën schrijven...');
  const dirs = new Set();
  for (const p of pages) {
    const isParent = hasChildren(p.slug);
    const rel = isParent ? path.join(p.slug, 'index.md') : `${p.slug}.md`;
    let d = path.dirname(rel);
    while (d && d !== '.' ) { dirs.add(d.replace(/\\/g, '/')); d = path.dirname(d); }
  }
  for (const d of dirs) {
    const label = slugs.has(d) ? titleOf.get(d) : (GROUP_LABELS[d] || d.split('/').pop());
    let position;
    if (orderOf.has(d)) position = orderOf.get(d);
    else {
      position = Math.min(...pages.filter((p) => p.slug.startsWith(d + '/')).map((p) => orderOf.get(p.slug)));
    }
    const cat = { label, position };
    fs.writeFileSync(path.join(DOCS, d, '_category_.json'), JSON.stringify(cat, null, 2) + '\n');
  }

  console.log('\nKlaar.');
  console.log(`  Pagina's geschreven: ${pages.length}`);
  console.log(`  Categorieën: ${dirs.size}`);
  console.log(`  Afbeeldingen: ${allImgUrls.size}, Bijlagen: ${allFileUrls.size}`);
  if (warnings.length) {
    console.log(`\nLET OP - asset-aantallen komen niet overeen (${warnings.length}):`);
    warnings.forEach((w) => console.log(w));
  } else {
    console.log('  Alle asset-aantallen komen overeen.');
  }
}

// convert-variant die rechtstreeks met lokale namen werkt (i.p.v. URL's)
function convertWithLocalNames(md, imgLocal, fileLocal, slug, linkCtx) {
  md = stripLeadNote(md);

  // GitBook zet expliciete anker-tags in koppen: `### Titel <a href="#id" id="id"></a>`.
  // In Docusaurus wordt de kop al in een anker gewikkeld -> geneste <a>. Omzetten naar
  // de Docusaurus {#id}-heading-syntax zodat de exacte anchor-id behouden blijft.
  md = md.replace(
    /^(#{1,6}\s+.*?)\s*<a\s+href="#[^"]*"\s+id="([^"]*)"><\/a>\s*$/gm,
    '$1 {#$2}',
  );
  md = md.replace(/<a\s+href="#[^"]*"\s+id="[^"]*"><\/a>/g, '');

  // Interne cross-links naar andere cursuspagina's -> Docusaurus-routes.
  // Vormen: /databanken/<slug>.md[#anchor]  en  https://apwt.gitbook.io/databanken/<slug>.md[#anchor]
  md = md.replace(
    /\]\((?:https?:\/\/apwt\.gitbook\.io)?\/databanken\/([A-Za-z0-9/_-]+?)\.md(#[^)]*)?\)/g,
    (m, target, anchor = '') => {
      if (!linkCtx.slugs.has(target)) return m; // onbekend -> ongemoeid laten
      const base = target === 'readme'
        ? '/docs/'
        : (linkCtx.hasChildren(target) ? `/docs/${target}/` : `/docs/${target}`);
      return `](${base}${anchor || ''})`;
    },
  );

  md = md.replace(/\{%\s*embed\s+url="<?([^">]+?)>?"\s*%\}/g, (_m, u) => `[${u}](${u})`);
  md = md.replace(/\{%\s*endembed\s*%\}/g, '');
  md = md.replace(/\{%\s*content-ref\s+url="<?([^">]+?)>?"\s*%\}/g, (_m, u) => `[${u}](${u})`);
  md = md.replace(/\{%\s*endcontent-ref\s*%\}/g, '');
  md = md.replace(/\{%\s*code[^%]*%\}\s*\n?/g, '');
  md = md.replace(/\n?[ \t]*\{%\s*endcode\s*%\}/g, '');

  // {% file %} in twee vormen:
  //   blok:   {% file src="X" %}\n<caption>\n{% endfile %}
  //   simpel: {% file src="X" %}   (gevolgd door een lege regel + gewone inhoud)
  // -> markdownlink naar de gedownloade bijlage (linktekst = bestandsnaam).
  let fi = 0;
  md = md.replace(
    /\{%\s*file\s+src="\/files\/[A-Za-z0-9]+"\s*%\}(?:\n[^\n]+\n\{%\s*endfile\s*%\})?/g,
    () => {
      const name = fileLocal[fi++];
      if (!name) return '';
      return `[${name}](/downloads/databanken/${name})`;
    },
  );
  md = md.replace(/\{%\s*endfile\s*%\}/g, ''); // veiligheidsnet

  // Resterende /files/<id> = afbeeldingen. Beperkt tot echte GitBook-id's (>=16 tekens)
  // zodat de zojuist ingevoegde /downloads/... en /img/... links ongemoeid blijven.
  let ii = 0;
  md = md.replace(/\/files\/[A-Za-z0-9]{16,}/g, () => {
    const name = imgLocal[ii++];
    if (!name) return '/files/MISSING';
    return `/img/databanken/${name}`;
  });

  md = convertHints(md);
  md = md.replace(/[—–]/g, '-');
  md = md.replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n';
  return { md };
}

main().catch((e) => { console.error(e); process.exit(1); });
