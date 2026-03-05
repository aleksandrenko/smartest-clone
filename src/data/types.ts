// Word from the 400-word study list
export interface Word {
  id: number;
  english: string;
  bulgarian: string;
  sentence: string;
}

// ─── Question Types (matching real SmartTest) ────────────────────────────
export enum QuestionType {
  /** Q1-7: "Напишете думата, която чувате" — audio plays word, student types spelling */
  ListenAndType = 'listen-and-type',
  /** Q8-14: Word shown (some misspelled), student picks correct/incorrect */
  SpellingJudge = 'spelling-judge',
  /** Q15: Checkboxes — select ALL correctly spelled words from a list */
  SelectCorrectlySpelled = 'select-correctly-spelled',
  /** Q16-20: Image + word with missing letters, fill the blanks */
  MissingLetters = 'missing-letters',
  /** Q21-22: Drag-drop matching — EN↔BG translation OR word halves */
  MatchPairs = 'match-pairs',
  /** Q23: Checkboxes — select words that ARE in your study list */
  WordsFromYourList = 'words-from-your-list',
}

// ─── Question Interfaces ─────────────────────────────────────────────────

export interface ListenAndTypeQuestion {
  id: string;
  type: QuestionType.ListenAndType;
  /** The correct English word to spell */
  word: Word;
  /** Points for this question */
  points: number;
}

export interface SpellingJudgeQuestion {
  id: string;
  type: QuestionType.SpellingJudge;
  /** The word displayed (may be correct or misspelled) */
  displayedWord: string;
  /** Whether the displayed word is correctly spelled */
  isCorrectlySpelled: boolean;
  /** The correct spelling (for showing after submit) */
  correctWord: Word;
  /** Points for this question */
  points: number;
}

export interface SelectCorrectlySpelledQuestion {
  id: string;
  type: QuestionType.SelectCorrectlySpelled;
  /** List of words, some correct and some misspelled */
  words: Array<{
    displayed: string;
    isCorrect: boolean;
    correctSpelling: string;
  }>;
  /** Points for this question */
  points: number;
}

export interface MissingLettersQuestion {
  id: string;
  type: QuestionType.MissingLetters;
  /** The word with missing letters */
  word: Word;
  /** Indices of characters that are blanked out (0-based) */
  blankIndices: number[];
  /** Optional image URL (Unsplash/placeholder) */
  imageUrl?: string;
  /** Points for this question */
  points: number;
}

export interface MatchPairsQuestion {
  id: string;
  type: QuestionType.MatchPairs;
  /** Variant: 'translation' = EN↔BG, 'word-halves' = split word parts */
  variant: 'translation' | 'word-halves';
  /** The pairs to match (left side → right side) */
  pairs: Array<{ left: string; right: string }>;
  /** Points for this question */
  points: number;
}

export interface WordsFromYourListQuestion {
  id: string;
  type: QuestionType.WordsFromYourList;
  /** List of words — some from the study list, some decoys */
  words: Array<{
    english: string;
    isFromList: boolean;
  }>;
  /** Points for this question */
  points: number;
}

// Union type for all questions
export type Question =
  | ListenAndTypeQuestion
  | SpellingJudgeQuestion
  | SelectCorrectlySpelledQuestion
  | MissingLettersQuestion
  | MatchPairsQuestion
  | WordsFromYourListQuestion;

// ─── Answer Types ────────────────────────────────────────────────────────

export interface ListenAndTypeAnswer {
  type: QuestionType.ListenAndType;
  /** What the student typed */
  typedWord: string;
}

export interface SpellingJudgeAnswer {
  type: QuestionType.SpellingJudge;
  /** Student's judgment: true = "correct", false = "incorrect", null = unanswered */
  judgment: boolean | null;
}

export interface SelectCorrectlySpelledAnswer {
  type: QuestionType.SelectCorrectlySpelled;
  /** Indices of words the student selected as correct */
  selectedIndices: number[];
}

export interface MissingLettersAnswer {
  type: QuestionType.MissingLetters;
  /** Map of blankIndex → letter(s) the student typed */
  filledLetters: Record<number, string>;
}

export interface MatchPairsAnswer {
  type: QuestionType.MatchPairs;
  /** Map of left item → right item the student matched */
  pairings: Record<string, string>;
}

export interface WordsFromYourListAnswer {
  type: QuestionType.WordsFromYourList;
  /** Indices of words the student selected as from the list */
  selectedIndices: number[];
}

export type UserAnswerData =
  | ListenAndTypeAnswer
  | SpellingJudgeAnswer
  | SelectCorrectlySpelledAnswer
  | MissingLettersAnswer
  | MatchPairsAnswer
  | WordsFromYourListAnswer;

// ─── Scoring ─────────────────────────────────────────────────────────────

export interface UserAnswer {
  questionId: string;
  answer: UserAnswerData;
  isCorrect: boolean | null; // null = not yet graded
  earnedPoints: number;
}

// ─── Test Config ─────────────────────────────────────────────────────────

export interface TestConfig {
  /** Timer in minutes (null = no timer) */
  timerMinutes: number | null;
}

// ─── Test Distribution (matches real SmartTest) ──────────────────────────

export const TEST_DISTRIBUTION = {
  [QuestionType.ListenAndType]: { count: 7, pointsEach: 2 },
  [QuestionType.SpellingJudge]: { count: 7, pointsEach: 2 },
  [QuestionType.SelectCorrectlySpelled]: { count: 1, pointsEach: 6 },
  [QuestionType.MissingLetters]: { count: 5, pointsEach: 2 },
  [QuestionType.MatchPairs]: { count: 2, pointsEach: 5 },
  [QuestionType.WordsFromYourList]: { count: 1, pointsEach: 5 },
} as const;

export const TOTAL_QUESTIONS = 23;
export const TOTAL_POINTS = 50;
