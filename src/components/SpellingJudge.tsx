import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircleRounded, CancelRounded } from '@mui/icons-material';
import { SpellingJudgeQuestion } from '../data/types';

interface SpellingJudgeProps {
  question: SpellingJudgeQuestion;
  judgment: boolean | null;
  onJudge: (isCorrect: boolean) => void;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const SpellingJudge: React.FC<SpellingJudgeProps> = ({
  question,
  judgment,
  onJudge,
  isSubmitted,
  isCorrect,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Word to judge */}
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#272364',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        {question.displayedWord}
      </Typography>

      {/* Buttons container */}
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          marginBottom: isSubmitted ? '24px' : '0px',
        }}
      >
        {/* Правилно (Correct) Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            onClick={() => !isSubmitted && onJudge(true)}
            disabled={isSubmitted}
            sx={{
              borderRadius: '25px',
              padding: '10px 32px',
              fontWeight: 700,
              backgroundColor:
                judgment === true && !isSubmitted ? '#1dc198' : 'transparent',
              color: judgment === true && !isSubmitted ? 'white' : '#464555',
              border:
                judgment === true && !isSubmitted
                  ? 'none'
                  : '1px solid #cedaf3',
              '&:hover': {
                backgroundColor:
                  judgment === true && !isSubmitted ? '#1dc198' : 'transparent',
              },
              '&:disabled': {
                backgroundColor:
                  judgment === true ? '#1dc198' : 'transparent',
                color: judgment === true ? 'white' : '#464555',
                border:
                  judgment === true && isSubmitted
                    ? 'none'
                    : '1px solid #cedaf3',
              },
            }}
          >
            Правилно
          </Button>
          {isSubmitted && judgment === true && (
            <CheckCircleRounded sx={{ color: '#1dc198', fontSize: '24px' }} />
          )}
          {isSubmitted && judgment === true && isCorrect === false && (
            <CancelRounded sx={{ color: '#ff397e', fontSize: '24px' }} />
          )}
        </Box>

        {/* Грешно (Incorrect) Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            onClick={() => !isSubmitted && onJudge(false)}
            disabled={isSubmitted}
            sx={{
              borderRadius: '25px',
              padding: '10px 32px',
              fontWeight: 700,
              backgroundColor:
                judgment === false && !isSubmitted ? '#ff397e' : 'transparent',
              color: judgment === false && !isSubmitted ? 'white' : '#464555',
              border:
                judgment === false && !isSubmitted
                  ? 'none'
                  : '1px solid #cedaf3',
              '&:hover': {
                backgroundColor:
                  judgment === false && !isSubmitted ? '#ff397e' : 'transparent',
              },
              '&:disabled': {
                backgroundColor:
                  judgment === false ? '#ff397e' : 'transparent',
                color: judgment === false ? 'white' : '#464555',
                border:
                  judgment === false && isSubmitted
                    ? 'none'
                    : '1px solid #cedaf3',
              },
            }}
          >
            Грешно
          </Button>
          {isSubmitted && judgment === false && (
            <CheckCircleRounded sx={{ color: '#1dc198', fontSize: '24px' }} />
          )}
          {isSubmitted && judgment === false && isCorrect === false && (
            <CancelRounded sx={{ color: '#ff397e', fontSize: '24px' }} />
          )}
        </Box>
      </Box>

      {/* Feedback message */}
      {isSubmitted && isCorrect === false && (
        <Typography
          sx={{
            color: '#1dc198',
            fontSize: '14px',
            fontWeight: 600,
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          Правилното изписване е: <strong>{question.correctWord.english}</strong>
        </Typography>
      )}
    </Box>
  );
};

export default SpellingJudge;
