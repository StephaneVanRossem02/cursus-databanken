/**
 * Cloudflare Worker voor de databanken-tutor (oefening-assistent).
 *
 * Waarom deze Worker bestaat: de modeloplossingen mogen niet in de JS-bundel van de site
 * terechtkomen, want die is leesbaar voor elke student (F5 / view-source). Ze leven daarom
 * in oplossingen.json naast dit bestand, en dat bestand wordt nergens door de frontend
 * geimporteerd. De Worker plakt de juiste oplossing bij de system prompt en stuurt het
 * geheel door naar Google.
 *
 * De Worker heeft GEEN eigen Gemini-key. Hij gebruikt die van de student, die per aanvraag
 * wordt meegestuurd en nergens bewaard of gelogd wordt. Wie dit endpoint vindt, kan er dus
 * geen gedeeld quotum mee leegtrekken.
 *
 * Het antwoord van Google wordt onbewerkt teruggegeven, zodat de foutafhandeling in de
 * browser identiek blijft aan het terugvalpad dat rechtstreeks met Google praat.
 */

import { bouwSystemPrompt, zoekOefening } from '../../src/components/OefeningAssistent/prompt.js';
import oplossingenData from '../oplossingen.json';

const TOEGELATEN_ORIGINS = [
  'https://stephanevanrossem02.github.io',
  'http://localhost:3000',
  'http://localhost:3005',
];

/** Bovengrenzen, zodat een kapotte of kwaadwillige client de Worker niet kan belasten. */
const MAX_BEURTEN = 20;
const MAX_TEKENS_PER_BEURT = 8000;

function corsHeaders(origin) {
  const toegestaan = TOEGELATEN_ORIGINS.includes((origin || '').toLowerCase());
  return {
    'Access-Control-Allow-Origin': toegestaan ? origin : TOEGELATEN_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-student-key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/** Zelfde vorm als een foutantwoord van Google, zodat de browser maar een pad nodig heeft. */
function fout(boodschap, status, origin) {
  return json({ error: { message: boodschap, code: status } }, status, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return fout('Enkel POST wordt ondersteund.', 405, origin);
    }
    if (origin && !TOEGELATEN_ORIGINS.includes(origin.toLowerCase())) {
      return fout('Deze site mag deze assistent niet gebruiken.', 403, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return fout('De aanvraag was geen geldige JSON.', 400, origin);
    }

    // De key van de student. Bewust een eigen header: hij gaat niet in de URL en wordt
    // hieronder nergens gelogd of bewaard.
    const apiKey = request.headers.get('x-student-key');
    if (!apiKey) {
      return fout('Er is geen API-key meegestuurd.', 401, origin);
    }

    const { oefening, hoofdstuk, geschiedenis, model, generationConfig } = body ?? {};

    if (!oefening || typeof oefening !== 'string' || !zoekOefening(oefening)) {
      return fout('Onbekende oefening.', 400, origin);
    }
    if (!Array.isArray(geschiedenis) || geschiedenis.length === 0) {
      return fout('Er is geen vraag meegestuurd.', 400, origin);
    }
    if (geschiedenis.length > MAX_BEURTEN) {
      return fout('Het gesprek is te lang.', 413, origin);
    }
    if (geschiedenis.some((b) => (b?.parts?.[0]?.text ?? '').length > MAX_TEKENS_PER_BEURT)) {
      return fout('Een van je berichten is te lang.', 413, origin);
    }

    const oplossing = oplossingenData.oplossingen?.[oefening] ?? null;
    // Een lege {} in oplossingen.json telt niet als oplossing: dan gedraagt de Worker
    // zich als het terugvalpad in plaats van een leeg blok in de prompt te zetten.
    const heeftInhoud = oplossing && Object.keys(oplossing).length > 0;

    const systemPrompt = bouwSystemPrompt({
      oefeningId: oefening,
      hoofdstukId: hoofdstuk,
      oplossing: heeftInhoud ? oplossing : null,
    });

    const modelNaam = typeof model === 'string' && model ? model : 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelNaam,
    )}:generateContent`;

    let antwoord;
    try {
      antwoord = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geschiedenis,
          generationConfig: generationConfig ?? {},
        }),
      });
    } catch {
      return fout('De assistent kon Google niet bereiken.', 502, origin);
    }

    // Onbewerkt doorgeven, inclusief de statuscode. De browser vertaalt 400, 429 en de
    // rest al naar begrijpelijke meldingen; dat hoeft hier niet nog eens.
    const tekst = await antwoord.text();
    return new Response(tekst, {
      status: antwoord.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  },
};
