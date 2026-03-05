import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  Question,
  QuestionType,
} from '../data/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  isSubmitted: boolean;
  earnedPoints?: number;
  children: React.ReactNode;
}

function getQuestionTitle(question: Question): string {
  switch (question.type) {
    case QuestionType.ListenAndType:
      return 'Напишете думата, която чувате';
    case QuestionType.SpellingJudge:
      return 'Правилно ли е написана думата?';
    case QuestionType.SelectCorrectlySpelled:
      return 'Изберете всички думи, които са написани ПРАВИЛНО';
    case QuestionType.MissingLetters:
      return 'Кои са липсващите букви?';
    case QuestionType.MatchPairs:
      return question.variant === 'translation'
        ? 'Свържете думата на английски с превода на български'
        : 'Свържете двете части в правилна дума';
    case QuestionType.WordsFromYourList:
      return 'Изберете думите от списъка за подготовка';
  }
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  isSubmitted,
  earnedPoints,
  children,
}) => {
  const title = getQuestionTitle(question);
  const maxPoints = question.points;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: '20px',
        border: '1px solid #e8e8e8',
        position: 'relative',
        backgroundColor: '#fff',
      }}
    >
      {/* Points badge — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          border: `1px solid ${isSubmitted ? '#ff397e' : '#464555'}`,
          borderRadius: '5px',
          px: 1.5,
          py: 0.25,
          fontSize: 14,
          fontWeight: 700,
          color: isSubmitted ? '#ff397e' : '#464555',
          whiteSpace: 'nowrap',
        }}
      >
        {isSubmitted
          ? `${earnedPoints ?? 0} от ${maxPoints} т.`
          : `${maxPoints} т.`}
      </Box>

      {/* Question number + title */}
      <Box sx={{ mb: 2, pr: 8 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: '#36363f',
            fontSize: 16,
          }}
        >
          <Box
            component="span"
            sx={{
              color: '#394da8',
              fontWeight: 800,
              mr: 1,
            }}
          >
            {questionNumber}.
          </Box>
          {title}
        </Typography>
      </Box>

      {/* Question content */}
      {children}
    </Paper>
  );
};

export default QuestionCard;
