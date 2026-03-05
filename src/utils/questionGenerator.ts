import {
  Question,
  QuestionType,
  ListenAndTypeQuestion,
  SpellingJudgeQuestion,
  SelectCorrectlySpelledQuestion,
  MissingLettersQuestion,
  MatchPairsQuestion,
  WordsFromYourListQuestion,
  UserAnswer,
  UserAnswerData,
  ListenAndTypeAnswer,
  SpellingJudgeAnswer,
  SelectCorrectlySpelledAnswer,
  MissingLettersAnswer,
  MatchPairsAnswer,
  WordsFromYourListAnswer,
  Word,
  TEST_DISTRIBUTION,
} from '../data/types';
import { words as allWords } from '../data/words';

// ─── Utility ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

let questionCounter = 0;
function nextId(): string {
  return `q-${++questionCounter}`;
}

// ─── Realistic Misspelling Engine ─────────────────────────────────────────
//
// Based on common spelling error patterns observed in children & ESL learners:
//  1. Vowel confusion (e↔i, a↔e, o↔u) — the #1 error type
//  2. Double letter errors (dropping or adding double consonants)
//  3. Silent letter omission (k in knife, w in write, b in doubt)
//  4. Phonetic substitution (ph↔f, ght↔t, ck↔k)
//  5. Common suffix confusion (-tion/-sion, -ible/-able, -ence/-ance)
//  6. Schwa vowel confusion (unstressed vowels all sound like /ə/)
//  7. Adjacent letter transposition (recieve instead of receive)
//

const VOWELS = new Set('aeiou');

// Pairs of vowels commonly confused with each other (bidirectional)
const VOWEL_SWAPS: Array<[string, string]> = [
  ['e', 'i'],  // recieve/receive, definately/definitely
  ['a', 'e'],  // seperate/separate, neccessary/necessary
  ['a', 'u'],  // languge/language
  ['o', 'u'],  // occurr/occur, colour/color
  ['i', 'y'],  // beautifyl/beautiful, familiy/family
  ['e', 'a'],  // pleasent/pleasant, independant/independent
  ['a', 'i'],  // maintanance/maintenance, villian/villain
  ['o', 'a'],  // comparsion/comparison
];

// Common phonetic substitutions
const PHONETIC_SUBS: Array<{ pattern: string; replacement: string }> = [
  { pattern: 'ph', replacement: 'f' },    // fotograph
  { pattern: 'ght', replacement: 'te' },   // nite (night)
  { pattern: 'ck', replacement: 'k' },     // bak (back)
  { pattern: 'tion', replacement: 'shon' }, // attenshon
  { pattern: 'sion', replacement: 'tion' }, // confution
  { pattern: 'ible', replacement: 'able' }, // possable
  { pattern: 'able', replacement: 'ible' }, // valuible
  { pattern: 'ence', replacement: 'ance' }, // differance
  { pattern: 'ance', replacement: 'ence' }, // importence
  { pattern: 'ous', replacement: 'us' },    // dangerus
  { pattern: 'ious', replacement: 'ous' },  // prevous
  { pattern: 'eous', replacement: 'ous' },  // gorgous
  { pattern: 'ful', replacement: 'full' },  // beautifull
  { pattern: 'ly', replacement: 'lly' },    // basiclly
  { pattern: 'lly', replacement: 'ly' },    // finaly
  { pattern: 'ei', replacement: 'ie' },     // recieve
  { pattern: 'ie', replacement: 'ei' },     // beleive
  { pattern: 'ous', replacement: 'ouse' },  // famouse
  { pattern: 'our', replacement: 'or' },    // color/colour variants
  { pattern: 'qu', replacement: 'kw' },     // kwiet
  { pattern: 'wh', replacement: 'w' },      // wen (when)
  { pattern: 'ght', replacement: 'ht' },    // niht (night)
  { pattern: 'dge', replacement: 'ge' },    // brige (bridge)
  { pattern: 'tch', replacement: 'ch' },    // wach (watch)
];

// Silent letters that kids often drop
const SILENT_LETTER_PATTERNS: Array<{ pattern: string; replacement: string }> = [
  { pattern: 'kn', replacement: 'n' },   // nife (knife)
  { pattern: 'wr', replacement: 'r' },   // rite (write)
  { pattern: 'gn', replacement: 'n' },   // nat (gnat)
  { pattern: 'mb', replacement: 'm' },   // clim (climb)
  { pattern: 'bt', replacement: 't' },   // dout (doubt)
  { pattern: 'mn', replacement: 'n' },   // autun (autumn)
  { pattern: 'sc', replacement: 's' },   // sience (science)
  { pattern: 'ps', replacement: 's' },   // sychology
  { pattern: 'ght', replacement: 'gt' }, // nigte
];

// Letters commonly doubled (or un-doubled) erroneously
const DOUBLE_LETTER_TARGETS = 'bcdfglmnprst';

type MisspellStrategy = (word: string) => string | null;

/**
 * Strategy 1: Confuse a vowel with a similar-sounding vowel.
 * E.g., "separate" → "seperate", "definite" → "definate"
 */
const confuseVowel: MisspellStrategy = (word) => {
  const lower = word.toLowerCase();
  // Shuffle swap pairs for variety
  const shuffled = [...VOWEL_SWAPS].sort(() => Math.random() - 0.5);
  for (const [a, b] of shuffled) {
    // Try both directions
    const targets = Math.random() < 0.5 ? [a, b] : [b, a];
    const from = targets[0];
    const to = targets[1];
    // Find all positions of `from` in the word (skip first letter)
    const positions: number[] = [];
    for (let i = 1; i < lower.length; i++) {
      if (lower[i] === from) positions.push(i);
    }
    if (positions.length > 0) {
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const isUpper = word[pos] !== word[pos].toLowerCase();
      return word.slice(0, pos) + (isUpper ? to.toUpperCase() : to) + word.slice(pos + 1);
    }
  }
  return null;
};

/**
 * Strategy 2: Mess with double letters.
 * Either drop one from a pair ("occassion" → "ocasion")
 * or add a double where there shouldn't be one ("tomorow" → "tommorow")
 */
const doubleLetterError: MisspellStrategy = (word) => {
  const lower = word.toLowerCase();
  // First try: find existing doubles and drop one
  for (let i = 0; i < lower.length - 1; i++) {
    if (lower[i] === lower[i + 1] && DOUBLE_LETTER_TARGETS.includes(lower[i])) {
      if (Math.random() < 0.6) {
        return word.slice(0, i) + word.slice(i + 1);
      }
    }
  }
  // Second try: find a single consonant and double it
  const candidates: number[] = [];
  for (let i = 1; i < lower.length - 1; i++) {
    if (DOUBLE_LETTER_TARGETS.includes(lower[i]) && lower[i] !== lower[i - 1] && lower[i] !== lower[i + 1]) {
      candidates.push(i);
    }
  }
  if (candidates.length > 0) {
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    return word.slice(0, pos) + word[pos] + word.slice(pos);
  }
  return null;
};

/**
 * Strategy 3: Apply a phonetic substitution.
 * E.g., "photograph" → "fotograph", "possible" → "possable"
 */
const phoneticSub: MisspellStrategy = (word) => {
  const lower = word.toLowerCase();
  const shuffled = [...PHONETIC_SUBS].sort(() => Math.random() - 0.5);
  for (const { pattern, replacement } of shuffled) {
    const idx = lower.indexOf(pattern);
    if (idx >= 0) {
      return word.slice(0, idx) + replacement + word.slice(idx + pattern.length);
    }
  }
  return null;
};

/**
 * Strategy 4: Drop a silent letter.
 * E.g., "knife" → "nife", "write" → "rite"
 */
const silentLetterDrop: MisspellStrategy = (word) => {
  const lower = word.toLowerCase();
  const shuffled = [...SILENT_LETTER_PATTERNS].sort(() => Math.random() - 0.5);
  for (const { pattern, replacement } of shuffled) {
    const idx = lower.indexOf(pattern);
    if (idx >= 0) {
      return word.slice(0, idx) + replacement + word.slice(idx + pattern.length);
    }
  }
  return null;
};

/**
 * Strategy 5: Transpose two adjacent letters (especially around vowels).
 * E.g., "receive" → "recieve", "their" → "thier"
 */
const transposeAdjacent: MisspellStrategy = (word) => {
  if (word.length < 4) return null;
  // Prefer swapping around vowel clusters
  const candidates: number[] = [];
  for (let i = 1; i < word.length - 2; i++) {
    const a = word[i].toLowerCase();
    const b = word[i + 1].toLowerCase();
    if (a !== b && (VOWELS.has(a) || VOWELS.has(b))) {
      candidates.push(i);
    }
  }
  if (candidates.length === 0) {
    // Fallback: any adjacent pair in the interior
    for (let i = 1; i < word.length - 2; i++) {
      if (word[i] !== word[i + 1]) candidates.push(i);
    }
  }
  if (candidates.length > 0) {
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    return word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
  }
  return null;
};

/**
 * Strategy 6: Schwa vowel error — replace an unstressed vowel
 * (typically in the middle of longer words) with 'e' or 'a'.
 * E.g., "definite" → "definate", "separate" → "seperate"
 */
const schwaError: MisspellStrategy = (word) => {
  if (word.length < 5) return null;
  const lower = word.toLowerCase();
  // Target vowels in the middle third of the word (likely unstressed)
  const start = Math.floor(word.length / 3);
  const end = Math.floor((word.length * 2) / 3);
  const candidates: number[] = [];
  for (let i = start; i <= end; i++) {
    if (VOWELS.has(lower[i])) candidates.push(i);
  }
  if (candidates.length > 0) {
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    const current = lower[pos];
    // Replace with 'e' or 'a' (most common schwa spellings)
    const schwaReplacements = ['e', 'a', 'i'].filter((v) => v !== current);
    const replacement = schwaReplacements[Math.floor(Math.random() * schwaReplacements.length)];
    const isUpper = word[pos] !== word[pos].toLowerCase();
    return word.slice(0, pos) + (isUpper ? replacement.toUpperCase() : replacement) + word.slice(pos + 1);
  }
  return null;
};

/**
 * Main misspelling function. Tries strategies in weighted random order.
 * Prefers more realistic errors (vowel confusion, doubles) over
 * less common ones (silent letters, transposition).
 */
function misspellWord(word: string): string {
  // Weighted strategy selection — more common errors have higher weight
  const weightedStrategies: Array<{ fn: MisspellStrategy; weight: number }> = [
    { fn: confuseVowel, weight: 30 },
    { fn: doubleLetterError, weight: 25 },
    { fn: phoneticSub, weight: 20 },
    { fn: schwaError, weight: 10 },
    { fn: transposeAdjacent, weight: 10 },
    { fn: silentLetterDrop, weight: 5 },
  ];

  // Try each strategy in weighted-random order
  const totalWeight = weightedStrategies.reduce((s, x) => s + x.weight, 0);
  const shuffled = [...weightedStrategies].sort(() => {
    const aRoll = Math.random() * totalWeight;
    const bRoll = Math.random() * totalWeight;
    return (bRoll * weightedStrategies[0].weight) - (aRoll * weightedStrategies[0].weight);
  });

  for (const { fn } of shuffled) {
    const result = fn(word);
    if (result && result.toLowerCase() !== word.toLowerCase()) {
      return result;
    }
  }

  // Final fallback — simple vowel swap (always works for words with vowels)
  const vowelPositions: number[] = [];
  for (let i = 1; i < word.length; i++) {
    if (VOWELS.has(word[i].toLowerCase())) vowelPositions.push(i);
  }
  if (vowelPositions.length > 0) {
    const pos = vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
    const current = word[pos].toLowerCase();
    const others = 'aeiou'.replace(current, '');
    const replacement = others[Math.floor(Math.random() * others.length)];
    return word.slice(0, pos) + replacement + word.slice(pos + 1);
  }

  // Ultra-fallback for vowelless words (very rare)
  return word.slice(0, -1) + word.slice(-1) + word.slice(-1);
}

// ─── Word halves splitter ────────────────────────────────────────────────

/** Split a compound or long word into two plausible halves */
function splitWordIntoHalves(word: string): { left: string; right: string } | null {
  if (word.length < 5) return null;

  // Known compound word splits
  const compounds: Record<string, [string, string]> = {
    afternoon: ['After', 'noon'],
    anything: ['Any', 'thing'],
    bathroom: ['Bath', 'room'],
    bedroom: ['Bed', 'room'],
    birthday: ['Birth', 'day'],
    blackboard: ['Black', 'board'],
    bookshelf: ['Book', 'shelf'],
    breakfast: ['Break', 'fast'],
    butterfly: ['Butter', 'fly'],
    classroom: ['Class', 'room'],
    cupboard: ['Cup', 'board'],
    downstairs: ['Down', 'stairs'],
    everything: ['Every', 'thing'],
    everywhere: ['Every', 'where'],
    football: ['Foot', 'ball'],
    grandfather: ['Grand', 'father'],
    grandmother: ['Grand', 'mother'],
    grasshopper: ['Grass', 'hopper'],
    homework: ['Home', 'work'],
    horseback: ['Horse', 'back'],
    keyboard: ['Key', 'board'],
    ladybug: ['Lady', 'bug'],
    lemonade: ['Lemon', 'ade'],
    lollipop: ['Lolli', 'pop'],
    lipstick: ['Lip', 'stick'],
    milkshake: ['Milk', 'shake'],
    moonlight: ['Moon', 'light'],
    newspaper: ['News', 'paper'],
    nightmare: ['Night', 'mare'],
    notebook: ['Note', 'book'],
    outside: ['Out', 'side'],
    playground: ['Play', 'ground'],
    rainbow: ['Rain', 'bow'],
    schoolbag: ['School', 'bag'],
    something: ['Some', 'thing'],
    sometimes: ['Some', 'times'],
    somewhere: ['Some', 'where'],
    strawberry: ['Straw', 'berry'],
    sunflower: ['Sun', 'flower'],
    sunshine: ['Sun', 'shine'],
    supermarket: ['Super', 'market'],
    toothbrush: ['Tooth', 'brush'],
    toothpaste: ['Tooth', 'paste'],
    understand: ['Under', 'stand'],
    upstairs: ['Up', 'stairs'],
    waterfall: ['Water', 'fall'],
    watermelon: ['Water', 'melon'],
    weekend: ['Week', 'end'],
    windmill: ['Wind', 'mill'],
    yesterday: ['Yester', 'day'],
    classmate: ['Class', 'mate'],
    furniture: ['Furni', 'ture'],
    shoulder: ['Shoul', 'der'],
    describe: ['Des', 'cribe'],
    important: ['Impor', 'tant'],
    beautiful: ['Beauti', 'ful'],
    wonderful: ['Wonder', 'ful'],
    dangerous: ['Danger', 'ous'],
    different: ['Differ', 'ent'],
    excellent: ['Excel', 'lent'],
    expensive: ['Expen', 'sive'],
    adventure: ['Adven', 'ture'],
    favourite: ['Favour', 'ite'],
    chocolate: ['Choco', 'late'],
    ambulance: ['Ambu', 'lance'],
    crocodile: ['Croco', 'dile'],
    beginning: ['Begin', 'ning'],
    delicious: ['Deli', 'cious'],
    passenger: ['Passen', 'ger'],
    celebrate: ['Cele', 'brate'],
    enormous: ['Enor', 'mous'],
    exercise: ['Exer', 'cise'],
    terrible: ['Terri', 'ble'],
    tomatoes: ['Toma', 'toes'],
    potatoes: ['Pota', 'toes'],
    tomorrow: ['Tomo', 'rrow'],
    surprised: ['Sur', 'prised'],
    museum: ['Mu', 'seum'],
    temperature: ['Temper', 'ature'],
  };

  const lower = word.toLowerCase();
  if (compounds[lower]) {
    return { left: compounds[lower][0], right: compounds[lower][1] };
  }

  // Generic split at roughly the middle, preferring syllable boundaries
  const mid = Math.ceil(word.length / 2);
  return {
    left: word.charAt(0).toUpperCase() + word.slice(1, mid),
    right: word.slice(mid),
  };
}

// ─── Image URLs for MissingLetters ───────────────────────────────────────

/** Returns a placeholder image URL based on the word's meaning */
function getImageForWord(word: string): string {
  // Use picsum for random images (consistent seed from word)
  const seed = word.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/300/200`;
}

// ─── Question Generators ─────────────────────────────────────────────────

function generateListenAndType(usedWords: Set<number>): ListenAndTypeQuestion[] {
  const available = allWords.filter((w) => !usedWords.has(w.id));
  const selected = pickRandom(available, TEST_DISTRIBUTION[QuestionType.ListenAndType].count);
  selected.forEach((w) => usedWords.add(w.id));

  return selected.map((word) => ({
    id: nextId(),
    type: QuestionType.ListenAndType as const,
    word,
    points: TEST_DISTRIBUTION[QuestionType.ListenAndType].pointsEach,
  }));
}

function generateSpellingJudge(usedWords: Set<number>): SpellingJudgeQuestion[] {
  const available = allWords.filter((w) => !usedWords.has(w.id));
  const selected = pickRandom(available, TEST_DISTRIBUTION[QuestionType.SpellingJudge].count);
  selected.forEach((w) => usedWords.add(w.id));

  return selected.map((word) => {
    // ~50% chance of being correctly spelled
    const isCorrect = Math.random() > 0.5;
    const displayed = isCorrect ? word.english : misspellWord(word.english);

    return {
      id: nextId(),
      type: QuestionType.SpellingJudge as const,
      displayedWord: displayed,
      isCorrectlySpelled: isCorrect,
      correctWord: word,
      points: TEST_DISTRIBUTION[QuestionType.SpellingJudge].pointsEach,
    };
  });
}

function generateSelectCorrectlySpelled(usedWords: Set<number>): SelectCorrectlySpelledQuestion[] {
  const available = allWords.filter((w) => !usedWords.has(w.id));
  const selected = pickRandom(available, 10); // ~10 words to choose from
  selected.forEach((w) => usedWords.add(w.id));

  // ~50% correct, ~50% misspelled
  const wordItems = selected.map((word) => {
    const isCorrect = Math.random() > 0.5;
    return {
      displayed: isCorrect ? word.english : misspellWord(word.english),
      isCorrect,
      correctSpelling: word.english,
    };
  });

  // Ensure at least 3 correct and 3 misspelled
  let correctCount = wordItems.filter((w) => w.isCorrect).length;
  let idx = 0;
  while (correctCount < 3 && idx < wordItems.length) {
    if (!wordItems[idx].isCorrect) {
      wordItems[idx].displayed = wordItems[idx].correctSpelling;
      wordItems[idx].isCorrect = true;
      correctCount++;
    }
    idx++;
  }
  let wrongCount = wordItems.filter((w) => !w.isCorrect).length;
  idx = wordItems.length - 1;
  while (wrongCount < 3 && idx >= 0) {
    if (wordItems[idx].isCorrect) {
      wordItems[idx].displayed = misspellWord(wordItems[idx].correctSpelling);
      wordItems[idx].isCorrect = false;
      wrongCount++;
    }
    idx--;
  }

  return [
    {
      id: nextId(),
      type: QuestionType.SelectCorrectlySpelled as const,
      words: shuffle(wordItems),
      points: TEST_DISTRIBUTION[QuestionType.SelectCorrectlySpelled].pointsEach,
    },
  ];
}

function generateMissingLetters(usedWords: Set<number>): MissingLettersQuestion[] {
  const available = allWords.filter((w) => !usedWords.has(w.id) && w.english.length >= 4);
  const selected = pickRandom(available, TEST_DISTRIBUTION[QuestionType.MissingLetters].count);
  selected.forEach((w) => usedWords.add(w.id));

  return selected.map((word) => {
    // Pick 1-3 random indices to blank out (prefer vowels for harder difficulty)
    const letters = [...word.english.toLowerCase()];
    const vowelIndices = letters
      .map((c, i) => (VOWELS.has(c) ? i : -1))
      .filter((i) => i > 0 && i < letters.length - 1); // skip first and last
    const consonantIndices = letters
      .map((c, i) => (!VOWELS.has(c) ? i : -1))
      .filter((i) => i > 0 && i < letters.length - 1);

    // Pick 1-2 blanks, prefer vowels
    const numBlanks = Math.min(2, Math.max(1, Math.floor(word.english.length / 3)));
    const pool = vowelIndices.length >= numBlanks ? vowelIndices : [...vowelIndices, ...consonantIndices];
    const blankIndices = pickRandom(pool, numBlanks).sort((a, b) => a - b);

    return {
      id: nextId(),
      type: QuestionType.MissingLetters as const,
      word,
      blankIndices,
      imageUrl: getImageForWord(word.english),
      points: TEST_DISTRIBUTION[QuestionType.MissingLetters].pointsEach,
    };
  });
}

function generateMatchPairs(usedWords: Set<number>): MatchPairsQuestion[] {
  const questions: MatchPairsQuestion[] = [];

  // Q1: Translation matching (EN ↔ BG) — 5 pairs
  const available1 = allWords.filter((w) => !usedWords.has(w.id));
  const translationWords = pickRandom(available1, 5);
  translationWords.forEach((w) => usedWords.add(w.id));

  questions.push({
    id: nextId(),
    type: QuestionType.MatchPairs as const,
    variant: 'translation',
    pairs: translationWords.map((w) => ({ left: w.english, right: w.bulgarian })),
    points: TEST_DISTRIBUTION[QuestionType.MatchPairs].pointsEach,
  });

  // Q2: Word halves — 5 pairs
  const available2 = allWords.filter((w) => !usedWords.has(w.id) && w.english.length >= 6);
  const halvesCandidates = shuffle(available2);
  const halvePairs: Array<{ left: string; right: string }> = [];
  const halveWordsUsed: Word[] = [];

  for (const w of halvesCandidates) {
    if (halvePairs.length >= 5) break;
    const split = splitWordIntoHalves(w.english);
    if (split && split.left.length >= 2 && split.right.length >= 2) {
      halvePairs.push(split);
      halveWordsUsed.push(w);
    }
  }
  halveWordsUsed.forEach((w) => usedWords.add(w.id));

  questions.push({
    id: nextId(),
    type: QuestionType.MatchPairs as const,
    variant: 'word-halves',
    pairs: halvePairs,
    points: TEST_DISTRIBUTION[QuestionType.MatchPairs].pointsEach,
  });

  return questions;
}

function generateWordsFromYourList(usedWords: Set<number>): WordsFromYourListQuestion[] {
  // Pick ~5 words from the study list and ~5 decoy words (not in list)
  const fromList = pickRandom(allWords, 5);

  // Generate decoys — common English words NOT in our 400-word list
  const decoyPool = [
    'algorithm', 'blockchain', 'cryptocurrency', 'debugging', 'elasticsearch',
    'fibonacci', 'graphite', 'hexadecimal', 'iteration', 'javascript',
    'kubernetes', 'logarithm', 'middleware', 'namespace', 'optimization',
    'palindrome', 'quadratic', 'recursion', 'serialization', 'throttle',
    'ubiquitous', 'validation', 'websocket', 'xenophobia', 'zeitgeist',
    'pneumonia', 'psychology', 'lieutenant', 'burgundy', 'champagne',
    'silhouette', 'boutique', 'chauffeur', 'entrepreneur', 'rendezvous',
  ];
  const allEnglishLower = new Set(allWords.map((w) => w.english.toLowerCase()));
  const validDecoys = decoyPool.filter((d) => !allEnglishLower.has(d.toLowerCase()));
  const selectedDecoys = pickRandom(validDecoys, 5);

  const items = shuffle([
    ...fromList.map((w) => ({ english: w.english, isFromList: true })),
    ...selectedDecoys.map((d) => ({ english: d, isFromList: false })),
  ]);

  return [
    {
      id: nextId(),
      type: QuestionType.WordsFromYourList as const,
      words: items,
      points: TEST_DISTRIBUTION[QuestionType.WordsFromYourList].pointsEach,
    },
  ];
}

// ─── Main Generator ──────────────────────────────────────────────────────

export function generateTest(): Question[] {
  questionCounter = 0;
  const usedWords = new Set<number>();

  const questions: Question[] = [
    ...generateListenAndType(usedWords),
    ...generateSpellingJudge(usedWords),
    ...generateSelectCorrectlySpelled(usedWords),
    ...generateMissingLetters(usedWords),
    ...generateMatchPairs(usedWords),
    ...generateWordsFromYourList(usedWords),
  ];

  return questions;
}

// ─── Scoring Functions ───────────────────────────────────────────────────

export function gradeQuestion(question: Question, answer: UserAnswerData): { isCorrect: boolean; earnedPoints: number } {
  switch (question.type) {
    case QuestionType.ListenAndType: {
      const a = answer as ListenAndTypeAnswer;
      const isCorrect = a.typedWord.trim().toLowerCase() === question.word.english.toLowerCase();
      return { isCorrect, earnedPoints: isCorrect ? question.points : 0 };
    }

    case QuestionType.SpellingJudge: {
      const a = answer as SpellingJudgeAnswer;
      if (a.judgment === null) return { isCorrect: false, earnedPoints: 0 };
      const isCorrect = a.judgment === question.isCorrectlySpelled;
      return { isCorrect, earnedPoints: isCorrect ? question.points : 0 };
    }

    case QuestionType.SelectCorrectlySpelled: {
      const a = answer as SelectCorrectlySpelledAnswer;
      const correctIndices = new Set(
        question.words.map((w, i) => (w.isCorrect ? i : -1)).filter((i) => i >= 0)
      );
      const selectedSet = new Set(a.selectedIndices);

      // Score: 1 point per correct selection/non-selection, scaled to question points
      let correctActions = 0;
      question.words.forEach((_, i) => {
        const shouldSelect = correctIndices.has(i);
        const didSelect = selectedSet.has(i);
        if (shouldSelect === didSelect) correctActions++;
      });

      const ratio = correctActions / question.words.length;
      const earnedPoints = Math.round(ratio * question.points);
      return { isCorrect: earnedPoints === question.points, earnedPoints };
    }

    case QuestionType.MissingLetters: {
      const a = answer as MissingLettersAnswer;
      const wordLower = question.word.english.toLowerCase();
      let allCorrect = true;

      for (const idx of question.blankIndices) {
        const expected = wordLower[idx];
        const given = (a.filledLetters[idx] ?? '').toLowerCase();
        if (given !== expected) {
          allCorrect = false;
          break;
        }
      }

      return { isCorrect: allCorrect, earnedPoints: allCorrect ? question.points : 0 };
    }

    case QuestionType.MatchPairs: {
      const a = answer as MatchPairsAnswer;
      let correctCount = 0;
      const correctMap = new Map(question.pairs.map((p) => [p.left, p.right]));

      for (const [left, right] of Object.entries(a.pairings)) {
        if (correctMap.get(left) === right) {
          correctCount++;
        }
      }

      const totalPairs = question.pairs.length;
      const earnedPoints = Math.round((correctCount / totalPairs) * question.points);
      return { isCorrect: correctCount === totalPairs, earnedPoints };
    }

    case QuestionType.WordsFromYourList: {
      const a = answer as WordsFromYourListAnswer;
      const correctIndices = new Set(
        question.words.map((w, i) => (w.isFromList ? i : -1)).filter((i) => i >= 0)
      );
      const selectedSet = new Set(a.selectedIndices);

      let correctActions = 0;
      question.words.forEach((_, i) => {
        const shouldSelect = correctIndices.has(i);
        const didSelect = selectedSet.has(i);
        if (shouldSelect === didSelect) correctActions++;
      });

      const ratio = correctActions / question.words.length;
      const earnedPoints = Math.round(ratio * question.points);
      return { isCorrect: earnedPoints === question.points, earnedPoints };
    }
  }
}

export function gradeAllQuestions(
  questions: Question[],
  answers: Map<string, UserAnswer>
): { totalEarned: number; gradedAnswers: Map<string, UserAnswer> } {
  let totalEarned = 0;
  const gradedAnswers = new Map<string, UserAnswer>();

  for (const q of questions) {
    const existing = answers.get(q.id);
    if (existing && existing.answer) {
      const { isCorrect, earnedPoints } = gradeQuestion(q, existing.answer);
      gradedAnswers.set(q.id, { ...existing, isCorrect, earnedPoints });
      totalEarned += earnedPoints;
    } else {
      gradedAnswers.set(q.id, {
        questionId: q.id,
        answer: getEmptyAnswer(q.type),
        isCorrect: false,
        earnedPoints: 0,
      });
    }
  }

  return { totalEarned, gradedAnswers };
}

function getEmptyAnswer(type: QuestionType): UserAnswerData {
  switch (type) {
    case QuestionType.ListenAndType:
      return { type: QuestionType.ListenAndType, typedWord: '' };
    case QuestionType.SpellingJudge:
      return { type: QuestionType.SpellingJudge, judgment: null };
    case QuestionType.SelectCorrectlySpelled:
      return { type: QuestionType.SelectCorrectlySpelled, selectedIndices: [] };
    case QuestionType.MissingLetters:
      return { type: QuestionType.MissingLetters, filledLetters: {} };
    case QuestionType.MatchPairs:
      return { type: QuestionType.MatchPairs, pairings: {} };
    case QuestionType.WordsFromYourList:
      return { type: QuestionType.WordsFromYourList, selectedIndices: [] };
  }
}
