import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import {
  Question,
  QuestionType,
  UserAnswer,
  ListenAndTypeQuestion,
  SpellingJudgeQuestion,
  SelectCorrectlySpelledQuestion,
  MissingLettersQuestion,
  MatchPairsQuestion,
  WordsFromYourListQuestion,
  ListenAndTypeAnswer,
  SpellingJudgeAnswer,
  SelectCorrectlySpelledAnswer,
  MissingLettersAnswer,
  MatchPairsAnswer,
  WordsFromYourListAnswer,
  UserAnswerData,
  TOTAL_POINTS,
} from '../data/types';
import QuestionCard from './QuestionCard';
import ListenAndType from './ListenAndType';
import SpellingJudge from './SpellingJudge';
import SelectCorrectlySpelled from './SelectCorrectlySpelled';
import MissingLetters from './MissingLetters';
import MatchPairs, { checkMatchPairsResult } from './MatchPairs';
import WordsFromYourList from './WordsFromYourList';
import ConfirmSubmitDialog from './ConfirmSubmitDialog';

interface TestSessionProps {
  questions: Question[];
  answers: Map<string, UserAnswer>;
  isSubmitted: boolean;
  totalEarned: number;
  timerSeconds: number | null;
  totalQuestions: number;
  totalPoints: number;
  unansweredCount: number;
  onUpdateAnswer: (questionId: string, answerData: UserAnswerData) => void;
  onSubmit: () => void;
  onReset: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const TestSession: React.FC<TestSessionProps> = ({
  questions,
  answers,
  isSubmitted,
  totalEarned,
  timerSeconds,
  totalQuestions,
  totalPoints,
  unansweredCount,
  onUpdateAnswer,
  onSubmit,
  onReset,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const answeredCount = totalQuestions - unansweredCount;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers.get(question.id);
    const answerData = answer?.answer;

    return (
      <QuestionCard
        key={question.id}
        question={question}
        questionNumber={index + 1}
        isSubmitted={isSubmitted}
        earnedPoints={answer?.earnedPoints}
      >
        {question.type === QuestionType.ListenAndType && (
          <ListenAndType
            question={question as ListenAndTypeQuestion}
            userInput={(answerData as ListenAndTypeAnswer)?.typedWord ?? ''}
            onInputChange={(value) =>
              onUpdateAnswer(question.id, {
                type: QuestionType.ListenAndType,
                typedWord: value,
              })
            }
            isSubmitted={isSubmitted}
            isCorrect={answer?.isCorrect ?? undefined}
          />
        )}

        {question.type === QuestionType.SpellingJudge && (
          <SpellingJudge
            question={question as SpellingJudgeQuestion}
            judgment={(answerData as SpellingJudgeAnswer)?.judgment ?? null}
            onJudge={(isCorrect) =>
              onUpdateAnswer(question.id, {
                type: QuestionType.SpellingJudge,
                judgment: isCorrect,
              })
            }
            isSubmitted={isSubmitted}
            isCorrect={answer?.isCorrect ?? undefined}
          />
        )}

        {question.type === QuestionType.SelectCorrectlySpelled && (
          <SelectCorrectlySpelled
            question={question as SelectCorrectlySpelledQuestion}
            selectedIndices={
              (answerData as SelectCorrectlySpelledAnswer)?.selectedIndices ?? []
            }
            onToggle={(idx) => {
              const current =
                (answerData as SelectCorrectlySpelledAnswer)?.selectedIndices ?? [];
              const newIndices = current.includes(idx)
                ? current.filter((i) => i !== idx)
                : [...current, idx];
              onUpdateAnswer(question.id, {
                type: QuestionType.SelectCorrectlySpelled,
                selectedIndices: newIndices,
              });
            }}
            isSubmitted={isSubmitted}
          />
        )}

        {question.type === QuestionType.MissingLetters && (
          <MissingLetters
            question={question as MissingLettersQuestion}
            filledLetters={
              (answerData as MissingLettersAnswer)?.filledLetters ?? {}
            }
            onLetterChange={(idx, value) => {
              const current =
                (answerData as MissingLettersAnswer)?.filledLetters ?? {};
              onUpdateAnswer(question.id, {
                type: QuestionType.MissingLetters,
                filledLetters: { ...current, [idx]: value },
              });
            }}
            isSubmitted={isSubmitted}
            isCorrect={answer?.isCorrect ?? undefined}
          />
        )}

        {question.type === QuestionType.MatchPairs && (
          <MatchPairs
            question={question as MatchPairsQuestion}
            userPairings={
              (answerData as MatchPairsAnswer)?.pairings ?? {}
            }
            onPairingsChange={(pairings) =>
              onUpdateAnswer(question.id, {
                type: QuestionType.MatchPairs,
                pairings,
              })
            }
            isSubmitted={isSubmitted}
            pairResults={
              isSubmitted
                ? checkMatchPairsResult(
                    question as MatchPairsQuestion,
                    (answerData as MatchPairsAnswer)?.pairings ?? {}
                  )
                : undefined
            }
          />
        )}

        {question.type === QuestionType.WordsFromYourList && (
          <WordsFromYourList
            question={question as WordsFromYourListQuestion}
            selectedIndices={
              (answerData as WordsFromYourListAnswer)?.selectedIndices ?? []
            }
            onToggle={(idx) => {
              const current =
                (answerData as WordsFromYourListAnswer)?.selectedIndices ?? [];
              const newIndices = current.includes(idx)
                ? current.filter((i) => i !== idx)
                : [...current, idx];
              onUpdateAnswer(question.id, {
                type: QuestionType.WordsFromYourList,
                selectedIndices: newIndices,
              });
            }}
            isSubmitted={isSubmitted}
          />
        )}
      </QuestionCard>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4ff' }}>
      {/* ─── Header Bar ─── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4f81bd 0%, #394da8 100%)',
          color: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Top green accent bar */}
        <Box sx={{ height: 4, backgroundColor: '#1dc198' }} />

        <Box sx={{ px: 3, py: 1.5 }}>
          {/* Logo + Title row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '-0.5px',
              }}
            >
              🐝 SmartTest
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.85, fontSize: 14 }}
            >
              Spelling Bee JUNIOR 2026 — Mock Test
            </Typography>
          </Box>

          {/* Info row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: 13 }}>
              {totalQuestions} въпроса, {totalPoints} точки
            </Typography>

            {timerSeconds !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: 'monospace',
                  }}
                >
                  Оставащо време: {formatTime(timerSeconds)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={isSubmitted ? 100 : progressPercent}
          sx={{
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#1dc198',
            },
          }}
        />
      </Box>

      {/* ─── Results summary (after submit) ─── */}
      {isSubmitted && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: 720,
              mx: 'auto',
              p: 3,
              borderRadius: '20px',
              border: '2px solid #1dc198',
              textAlign: 'center',
              mb: 2,
            }}
          >
            <CheckCircleRoundedIcon
              sx={{ fontSize: 48, color: '#1dc198', mb: 1 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#36363f', mb: 0.5 }}>
              Резултат: {totalEarned} от {TOTAL_POINTS} точки
            </Typography>
            <Typography variant="body1" sx={{ color: '#8c8c8c', mb: 2 }}>
              ({Math.round((totalEarned / TOTAL_POINTS) * 100)}% верни отговори)
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ReplayRoundedIcon />}
                onClick={onReset}
                sx={{
                  backgroundColor: '#1dc198',
                  '&:hover': { backgroundColor: '#17a583' },
                  borderRadius: '25px',
                  px: 4,
                  fontWeight: 700,
                }}
              >
                Нов тест
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ─── All questions (scrollable) ─── */}
      <Box
        sx={{
          maxWidth: 720,
          mx: 'auto',
          px: 2,
          py: 2,
        }}
      >
        {questions.map((q, i) => renderQuestion(q, i))}
      </Box>

      {/* ─── Submit button (fixed at bottom) ─── */}
      {!isSubmitted && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #e8e8e8',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 99,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setShowConfirm(true)}
            sx={{
              backgroundColor: '#1dc198',
              '&:hover': { backgroundColor: '#17a583' },
              borderRadius: '25px',
              px: 6,
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Предай теста
          </Button>
        </Box>
      )}

      {/* Extra bottom padding for fixed submit button */}
      {!isSubmitted && <Box sx={{ height: 80 }} />}

      {/* Confirm dialog */}
      <ConfirmSubmitDialog
        open={showConfirm}
        unansweredCount={unansweredCount}
        onConfirm={() => {
          setShowConfirm(false);
          onSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </Box>
  );
};

export default TestSession;
