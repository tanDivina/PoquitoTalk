/**
 * Text normalization and geography terminology helpers for Bocas del Toro.
 * Extracted to avoid circular dependencies between audio services.
 */

/**
 * Normalizes common speech-to-text misspellings, phonetic approximations,
 * and dialect variations of Bocas del Toro local geography and terms.
 * e.g. "Bustimentos" -> "Bastimentos"
 *      "Caranero" -> "Carenero"
 *      "Solarte" / "Zolarte" -> "Solarte"
 */
export function normalizeBocasTerminology(text: string): string {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Bastimentos variations
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][tT][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][dD][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][tT][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][aA][\s-]*[mM][eE][nN][tT][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');

  // 2. Carenero variations
  result = result.replace(/\b[cC][aA][rR][aAeEiI][\s-]*[nNñÑ][eEaAoO][rR][oOaA][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Carenero' : 'carenero');

  // 3. Solarte variations
  result = result.replace(/\b[sSzZ][oOaA][\s-]*[lL][aA][rR][tT][eEiIyY][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Solarte' : 'solarte');

  // 4. Old Bank variations
  result = result.replace(/\b[oO]ld?[\s-]?[bB][aAeE]n[gk]\b/gi, 'Old Bank');

  // 5. Red Frog variations
  result = result.replace(/\b[rR]ed[\s-]?[fF]ro[gk][s]?\b/gi, 'Red Frog');

  // 6. Bluff & Playa Bluff variations
  result = result.replace(/\b([pP]laya\s+)?[bB]luf{1,2}\b/gi, 'Playa Bluff');

  // 7. Bocas Town / Bocas City
  result = result.replace(/\b[bB]ocas\s+[tT][aAoO]wn\b/gi, 'Bocas Town');
  result = result.replace(/\b[bB]ocas\s+[cC]ity\b/gi, 'Bocas Town');

  // 8. Taxi 25 / Docks
  result = result.replace(/\b[tT]axi\s+(25|twenty[\s-]?five|veinticinco)\b/gi, 'Taxi 25');
  result = result.replace(/\b[mM]uelle\s+[tT]axi\s+(25|twenty[\s-]?five|veinticinco)\b/gi, 'Muelle Taxi 25');

  // 9. Local utilities & brands
  result = result.replace(/\b[nN]atur[gj]y\b/gi, 'Naturgy');
  result = result.replace(/\b[aA]gua[\s-]?[fF]iel\b/gi, 'Aguafiel');

  // 10. Natural spoken time normalization (prevents TTS pronouncing "3:00 PM" as "tres cero cero pe eme")
  result = normalizeSpanishSpokenTime(result);

  return result;
}

/**
 * Normalizes English/abbreviated time notation in Spanish text so TTS engines speak naturally.
 * e.g. "3:00 PM" -> "3 de la tarde"
 *      "8:00 AM" -> "8 de la mañana"
 *      "3:00" -> "3 en punto"
 */
export function normalizeSpanishSpokenTime(text: string): string {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // Convert 12:00 PM / 12:00 AM
  result = result.replace(/\b12:00\s*(?:pm|p\.m\.|PM|P\.M\.)\b/g, '12 del mediodía');
  result = result.replace(/\b12:00\s*(?:am|a\.m\.|AM|A\.M\.)\b/g, '12 de la medianoche');

  // Convert X:00 PM -> X de la tarde / de la noche
  result = result.replace(/\b(\d{1,2}):00\s*(?:pm|p\.m\.|PM|P\.M\.)\b/g, (_m, hour) => {
    const h = parseInt(hour, 10);
    if (h >= 7 && h <= 11) return `${h} de la noche`;
    return `${h} de la tarde`;
  });

  // Convert X:00 AM -> X de la mañana
  result = result.replace(/\b(\d{1,2}):00\s*(?:am|a\.m\.|AM|A\.M\.)\b/g, (_m, hour) => {
    return `${hour} de la mañana`;
  });

  // Convert X:30 PM
  result = result.replace(/\b(\d{1,2}):30\s*(?:pm|p\.m\.|PM|P\.M\.)\b/g, (_m, hour) => {
    const h = parseInt(hour, 10);
    if (h >= 7 && h <= 11) return `${h} y media de la noche`;
    return `${h} y media de la tarde`;
  });
  result = result.replace(/\b(\d{1,2}):30\s*(?:am|a\.m\.|AM|A\.M\.)\b/g, '$1 y media de la mañana');

  // Convert X:15 PM
  result = result.replace(/\b(\d{1,2}):15\s*(?:pm|p\.m\.|PM|P\.M\.)\b/g, (_m, hour) => {
    const h = parseInt(hour, 10);
    if (h >= 7 && h <= 11) return `${h} y cuarto de la noche`;
    return `${h} y cuarto de la tarde`;
  });

  // Convert arbitrary HH:MM PM -> H y M de la tarde
  result = result.replace(/\b(\d{1,2}):([0-5]\d)\s*(?:pm|p\.m\.|PM|P\.M\.)\b/g, (_m, hour, mins) => {
    const h = parseInt(hour, 10);
    const suffix = h >= 7 && h <= 11 ? 'de la noche' : 'de la tarde';
    return `${h} y ${parseInt(mins, 10)} ${suffix}`;
  });
  result = result.replace(/\b(\d{1,2}):([0-5]\d)\s*(?:am|a\.m\.|AM|A\.M\.)\b/g, (_m, hour, mins) => {
    return `${hour} y ${parseInt(mins, 10)} de la mañana`;
  });

  // Convert standalone X:00 -> X en punto
  result = result.replace(/\b(\d{1,2}):00\b/g, '$1 en punto');

  return result;
}

/**
 * Automatically detects and cleans up obvious speech repetitions, stutters, and loop hallucinations
 * e.g. "I, I need" -> "I need"
 *      "the the boat" -> "the boat"
 *      "Can you can you please" -> "Can you please"
 *      "I want to go I want to go to Bocas" -> "I want to go to Bocas"
 *      "Thank you. Thank you." -> "Thank you."
 */
export function cleanSpeechRepetitions(text: string): string {
  if (!text || typeof text !== "string") return "";

  let prev = "";
  let str = normalizeBocasTerminology(text.trim());

  // Strip stutter commas on immediate word repeats: "I, I" -> "I I"
  str = str.replace(/\b([a-zA-Z0-9'\u00C0-\u017F]+),\s+(\1)\b/gi, "$1 $2");

  // Sentence / clause repetitions separated by punctuation
  str = str.replace(/([^.?!,;\n]+[.?!,;\n]+)\s*\1+/gi, "$1");

  // Iteratively reduce consecutive repeated n-grams (from 5-word down to 1-word)
  let passes = 0;
  while (str !== prev && passes < 5) {
    prev = str;
    passes++;
    const tokens = str.split(/\s+/);

    for (let n = 5; n >= 1; n--) {
      let i = 0;
      const newTokens: string[] = [];
      while (i < tokens.length) {
        if (i + 2 * n <= tokens.length) {
          const chunk1 = tokens
            .slice(i, i + n)
            .map((w) => w.replace(/[.,?!;:"]/g, "").toLowerCase())
            .join(" ");
          const chunk2 = tokens
            .slice(i + n, i + 2 * n)
            .map((w) => w.replace(/[.,?!;:"]/g, "").toLowerCase())
            .join(" ");

          if (chunk1 && chunk1 === chunk2) {
            for (let k = 0; k < n; k++) {
              let tok = tokens[i + k].replace(/,$/, "");
              newTokens.push(tok);
            }
            i += 2 * n;
            continue;
          }
        }
        newTokens.push(tokens[i]);
        i++;
      }
      tokens.length = 0;
      tokens.push(...newTokens);
    }
    str = tokens.join(" ").replace(/,\s*,+/g, ",").replace(/\s+/g, " ").trim();
  }

  // Final pass of local phonetic normalization
  str = normalizeBocasTerminology(str);

  // Preserve initial capitalization
  if (text.length > 0 && text[0] === text[0].toUpperCase() && str.length > 0) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str;
}
