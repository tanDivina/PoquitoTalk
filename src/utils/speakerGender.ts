// Speaker gender for INCOMING audio (contractor ➔ user).
// Rule 11: incoming English must match the contractor's real identity, never the
// user's own voice setting. The contractor never has to do anything: we guess from
// the contact name, the expat can override with one tap, and anything unclear stays
// NEUTRAL (a consistent voice that is never wrong) instead of guessing.

export type SpeakerGender = 'MALE' | 'FEMALE' | 'NEUTRAL';

const MALE_NAMES = new Set([
  // Spanish / Latin American
  'aaron', 'abel', 'abraham', 'adan', 'adolfo', 'adrian', 'agustin', 'alberto', 'alejandro',
  'alfonso', 'alfredo', 'alonso', 'alvaro', 'andres', 'angel', 'anibal', 'antonio', 'armando', 'arturo',
  'augusto', 'aurelio', 'bartolo', 'benito', 'benjamin', 'bernardo', 'boris', 'bruno', 'camilo', 'carlos',
  'cesar', 'cristian', 'cristobal', 'damian', 'daniel', 'dario', 'david', 'diego', 'domingo', 'eduardo',
  'efrain', 'elias', 'eliseo', 'emilio', 'enrique', 'ernesto', 'esteban', 'eugenio', 'ezequiel', 'fabian',
  'federico', 'felipe', 'felix', 'fernando', 'fidel', 'francisco', 'gabriel', 'gerardo', 'german', 'gilberto',
  'gonzalo', 'gregorio', 'guillermo', 'gustavo', 'hector', 'heriberto', 'hernan', 'horacio', 'hugo', 'ignacio',
  'isaac', 'ismael', 'ivan', 'jacinto', 'jaime', 'javier', 'jesus', 'joaquin', 'jonathan', 'jorge',
  'jose', 'josue', 'juan', 'julian', 'julio', 'lazaro', 'leonardo', 'leonel', 'lorenzo', 'lucas',
  'luciano', 'luis', 'manuel', 'marcelo', 'marco', 'marcos', 'mario', 'martin', 'mateo', 'matias',
  'mauricio', 'maximiliano', 'miguel', 'moises', 'nelson', 'nestor', 'nicolas', 'octavio', 'omar', 'orlando',
  'oscar', 'pablo', 'pascual', 'patricio', 'pedro', 'rafael', 'ramiro', 'ramon', 'raul', 'ricardo',
  'roberto', 'rodolfo', 'rodrigo', 'rogelio', 'rolando', 'ruben', 'salvador', 'samuel', 'santiago', 'saul',
  'sebastian', 'sergio', 'silvio', 'tomas', 'ulises', 'valentin', 'vicente', 'victor', 'wilfredo', 'xavier',
  // English names common in Bocas del Toro
  'albert', 'alfred', 'anthony', 'arthur', 'charles', 'clifford', 'delroy', 'dennis', 'donald', 'edward',
  'eric', 'frank', 'george', 'harold', 'henry', 'james', 'john', 'joseph', 'kevin', 'leroy',
  'lloyd', 'mark', 'michael', 'paul', 'peter', 'richard', 'robert', 'ronald', 'roy', 'steven',
  'thomas', 'walter', 'wayne', 'william', 'winston',
]);

const FEMALE_NAMES = new Set([
  // Spanish / Latin American
  'adriana', 'alejandra', 'alicia', 'ana', 'andrea', 'angela', 'antonia', 'araceli', 'beatriz', 'berta',
  'blanca', 'camila', 'carla', 'carmen', 'carolina', 'catalina', 'cecilia', 'claudia', 'cristina', 'daniela',
  'diana', 'dolores', 'elena', 'elisa', 'elizabeth', 'emilia', 'esperanza', 'estela', 'esther', 'eva',
  'fabiola', 'fernanda', 'flor', 'gabriela', 'gladys', 'gloria', 'graciela', 'isabel', 'ivonne', 'jacqueline',
  'jessica', 'josefina', 'juana', 'julia', 'juliana', 'karina', 'laura', 'leticia', 'lidia', 'liliana',
  'lorena', 'lucia', 'luisa', 'luz', 'magdalena', 'maria', 'mariela', 'marisol', 'marta', 'martha',
  'mercedes', 'milagros', 'miriam', 'monica', 'nancy', 'natalia', 'nelly', 'norma', 'olga', 'paola',
  'patricia', 'paula', 'pilar', 'raquel', 'rebeca', 'rocio', 'rosa', 'rosario', 'ruth', 'sandra',
  'sara', 'silvia', 'sofia', 'susana', 'teresa', 'valentina', 'valeria', 'veronica', 'victoria', 'virginia',
  'ximena', 'yolanda', 'yesenia',
  // English names common in Bocas del Toro
  'alice', 'barbara', 'betty', 'carol', 'dorothy', 'emily', 'emma', 'glenda', 'grace', 'helen',
  'jennifer', 'joyce', 'karen', 'linda', 'lisa', 'margaret', 'mary', 'michelle', 'nicole', 'sharon',
  'susan',
]);

// Used for both men and women: never guess these.
const AMBIGUOUS_NAMES = new Set([
  'guadalupe', 'lupe', 'trinidad', 'cruz', 'ariel', 'reyes', 'celeste', 'noel', 'alexis', 'darcy',
  'jordan', 'alex', 'chris', 'sam', 'pat', 'francis', 'jean', 'yeri', 'dani',
]);

const MALE_TITLES = new Set(['don', 'senor', 'sr', 'mr', 'mister', 'hermano', 'padre']);
const FEMALE_TITLES = new Set(['dona', 'senora', 'sra', 'srta', 'senorita', 'mrs', 'ms', 'miss', 'dra', 'hermana', 'madre']);
// Titles that say nothing about gender: skip them and look at the next word.
const NEUTRAL_TITLES = new Set(['capitan', 'captain', 'capt', 'cap', 'dr', 'doctor', 'ing', 'lic', 'profe', 'maestro', 'tio', 'tia']);

function normalize(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Guess a contact's gender from how the expat saved them, e.g. "Carlos (A/C Technician)",
 * "Doña Rosa", "Captain Juan". Returns NEUTRAL whenever it is not confident:
 * business names ("Taxi 25"), job titles ("Plumber Bastimentos"), nicknames and
 * names used for both genders.
 */
export function guessSpeakerGenderFromName(contactName?: string | null): SpeakerGender {
  if (!contactName) return 'NEUTRAL';

  // Drop "(A/C Technician)"-style labels and anything after a dash or comma
  const cleaned = contactName.replace(/\(.*?\)/g, ' ').split(/[-–—,|/]/)[0];
  const words = cleaned.split(/\s+/).map(normalize).filter(Boolean);

  for (const word of words.slice(0, 3)) {
    if (MALE_TITLES.has(word)) return 'MALE';
    if (FEMALE_TITLES.has(word)) return 'FEMALE';
    if (NEUTRAL_TITLES.has(word)) continue;

    // First real word decides: "José María" is a man, "María José" is a woman
    if (AMBIGUOUS_NAMES.has(word)) return 'NEUTRAL';
    if (MALE_NAMES.has(word)) return 'MALE';
    if (FEMALE_NAMES.has(word)) return 'FEMALE';
    return 'NEUTRAL';
  }
  return 'NEUTRAL';
}

/** The expat's explicit choice always wins over the name guess. */
export function resolveSpeakerGender(explicit: SpeakerGender | undefined, contactName?: string | null): SpeakerGender {
  return explicit ?? guessSpeakerGenderFromName(contactName);
}
