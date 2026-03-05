import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { SelectCorrectlySpelledQuestion } from '../data/types';

interface SelectCorrectlySpelledProps {
  question: SelectCorrectlySpelledQuestion;
  selectedIndices: number[];
  onToggle: (index: number) => void;
  isSubmitted: boolean;
}

const SelectCorrectlySpelled: React.FC<SelectCorrectlySpelledProps> = ({
  question,
  selectedIndices,
  onToggle,
  isSubmitted,
}) => {
  return (
    <Box>
      {/* Instruction */}
      <Typography
        sx={{
          fontWeight: 700,
          mb: 3,
          color: '#36363f',
          fontSize: 16,
        }}
      >
        Изберете всички думи, които са написани{' '}
        <Box
          component="span"
          sx={{
            color: '#1dc198',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          ПРАВИЛНО
        </Box>
      </Typography>

      {/* Words List */}
      <Box>
        {question.words.map((wordItem, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isCorrect = wordItem.isCorrect;
          const isWrongSelection = isSubmitted && isSelected && !isCorrect;
          const isCorrectSelection = isSubmitted && isSelected && isCorrect;

          let bgColor = 'transparent';
          let wordColor = '#36363f';

          if (isSubmitted) {
            if (isCorrect) {
              wordColor = '#1dc198';
              if (isSelected) {
                bgColor = 'rgba(204, 253, 197, 0.3)';
              }
            } else {
              wordColor = '#ff397e';
              if (isSelected) {
                bgColor = 'rgba(255, 173, 173, 0.15)';
              }
            }
          }

          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: bgColor,
                transition: 'all 0.2s',
                cursor: isSubmitted ? 'default' : 'pointer',
                '&:hover': !isSubmitted
                  ? {
                      backgroundColor: 'rgba(29, 193, 152, 0.05)',
                    }
                  : {},
              }}
              onClick={() => !isSubmitted && onToggle(idx)}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => !isSubmitted && onToggle(idx)}
                disabled={isSubmitted}
                size="medium"
                sx={{
                  color: '#cedaf3',
                  '&.Mui-checked': {
                    color: '#1dc198',
                  },
                  mr: 1.5,
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: wordColor,
                    textDecoration: isSubmitted && !isCorrect ? 'line-through' : 'none',
                  }}
                >
                  {wordItem.displayed}
                </Typography>
                {isSubmitted && !isCorrect && (
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: '#1dc198',
                      fontWeight: 500,
                    }}
                  >
                    ({wordItem.correctSpelling})
                  </Typography>
                )}
              </Box>
              {isSubmitted && isCorrectSelection && (
                <CheckCircleRoundedIcon sx={{ color: '#1dc198', fontSize: 24, ml: 1 }} />
              )}
              {isSubmitted && isWrongSelection && (
                <CancelRoundedIcon sx={{ color: '#ff397e', fontSize: 24, ml: 1 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SelectCorrectlySpelled;
