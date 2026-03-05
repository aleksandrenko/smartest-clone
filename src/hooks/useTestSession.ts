import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Question,
  QuestionType,
  UserAnswer,
  UserAnswerData,
  ListenAndTypeAnswer,
  SpellingJudgeAnswer,
  SelectCorrectlySpelledAnswer,
  MissingLettersAnswer,
  MatchPairsAnswer,
  WordsFromYourListAnswer,
  TestConfig,
  TOTAL_QUESTIONS,
  TOTAL_POINTS,
} from '../data/types';
import { generateTest, gradeAllQuestions } from '../utils/questionGenerator';

export interface TestSessionState {
  questions: Question[];
  answers: Map<string, UserAnswer>;
  isSubmitted: boolean;
  totalEarned: number;
  timerSeconds: number | null;
  isTimerRunning: boolean;
}

function createEmptyAnswer(q: Question): UserAnswer {
  let answer: UserAnswerData;

  switch (q.type) {
    case QuestionType.ListenAndType:
      answer = { type: QuestionType.ListenAndType, typedWord: '' };
      break;
    case QuestionType.SpellingJudge:
      answer = { type: QuestionType.SpellingJudge, judgment: null };
      break;
    case QuestionType.SelectCorrectlySpelled:
      answer = { type: QuestionType.SelectCorrectlySpelled, selectedIndices: [] };
      break;
    case QuestionType.MissingLetters:
      answer = { type: QuestionType.MissingLetters, filledLetters: {} };
      break;
    case QuestionType.MatchPairs:
      answer = { type: QuestionType.MatchPairs, pairings: {} };
      break;
    case QuestionType.WordsFromYourList:
      answer = { type: QuestionType.WordsFromYourList, selectedIndices: [] };
      break;
  }

  return {
    questionId: q.id,
    answer,
    isCorrect: null,
    earnedPoints: 0,
  };
}

export function useTestSession() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start a new test
  const startTest = useCallback((config: TestConfig) => {
    const newQuestions = generateTest();
    const initialAnswers = new Map<string, UserAnswer>();
    newQuestions.forEach((q) => {
      initialAnswers.set(q.id, createEmptyAnswer(q));
    });

    setQuestions(newQuestions);
    setAnswers(initialAnswers);
    setIsSubmitted(false);
    setTotalEarned(0);

    if (config.timerMinutes) {
      setTimerSeconds(config.timerMinutes * 60);
      setIsTimerRunning(true);
    } else {
      setTimerSeconds(null);
      setIsTimerRunning(false);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, timerSeconds]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timerSeconds === 0 && !isSubmitted && questions.length > 0) {
      submitTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSeconds]);

  // Update an answer
  const updateAnswer = useCallback(
    (questionId: string, answerData: UserAnswerData) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = next.get(questionId);
        if (existing) {
          next.set(questionId, { ...existing, answer: answerData });
        }
        return next;
      });
    },
    []
  );

  // Submit and grade
  const submitTest = useCallback(() => {
    if (isSubmitted) return;

    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const { totalEarned: earned, gradedAnswers } = gradeAllQuestions(questions, answers);
    setAnswers(gradedAnswers);
    setTotalEarned(earned);
    setIsSubmitted(true);
  }, [questions, answers, isSubmitted]);

  // Count unanswered questions
  const unansweredCount = Array.from(answers.values()).filter((a) => {
    const data = a.answer;
    switch (data.type) {
      case QuestionType.ListenAndType:
        return !(data as ListenAndTypeAnswer).typedWord.trim();
      case QuestionType.SpellingJudge:
        return (data as SpellingJudgeAnswer).judgment === null;
      case QuestionType.SelectCorrectlySpelled:
        return (data as SelectCorrectlySpelledAnswer).selectedIndices.length === 0;
      case QuestionType.MissingLetters:
        return Object.keys((data as MissingLettersAnswer).filledLetters).length === 0;
      case QuestionType.MatchPairs:
        return Object.keys((data as MatchPairsAnswer).pairings).length === 0;
      case QuestionType.WordsFromYourList:
        return (data as WordsFromYourListAnswer).selectedIndices.length === 0;
    }
  }).length;

  // Reset
  const resetTest = useCallback(() => {
    setQuestions([]);
    setAnswers(new Map());
    setIsSubmitted(false);
    setTotalEarned(0);
    setTimerSeconds(null);
    setIsTimerRunning(false);
  }, []);

  return {
    questions,
    answers,
    isSubmitted,
    totalEarned,
    timerSeconds,
    isTimerRunning,
    totalQuestions: TOTAL_QUESTIONS,
    totalPoints: TOTAL_POINTS,
    unansweredCount,
    startTest,
    updateAnswer,
    submitTest,
    resetTest,
  };
}
