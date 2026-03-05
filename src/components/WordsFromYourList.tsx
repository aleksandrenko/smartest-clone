import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { WordsFromYourListQuestion } from '../data/types';

interface WordsFromYourListProps {
  question: WordsFromYourListQuestion;
  selectedIndices: number[];
  onToggle: (index: number) => void;
  isSubmitted: boolean;
}

const WordsFromYourList: React.FC<WordsFromYourListProps> = ({
  question,
  selectedIndices,
  onToggle,
  isSubmitted,
}) => {
  return (
    <Box>
      {/* Instruction Box */}
      <Box
        sx={{
          backgroundColor: 'rgba(57, 77, 168, 0.08)',
          borderRadius: '10px',
          padding: '12px 16px',
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            color: '#36363f',
            lineHeight: 1.6,
          }}
        >
          Някои от думите по-долу са от списъка ви с думи, а други – не. Изберете само думите, които{' '}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: '#1dc198',
            }}
          >
            СА ЧАСТ ОТ СПИСЪКА ЗА ПОДГОТОВКА
          </Box>
          .
        </Typography>
      </Box>

      {/* Words List */}
      <Box>
        {question.words.map((wordItem, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isFromList = wordItem.isFromList;
          const isWrongSelection = isSubmitted && isSelected && !isFromList;
          const isCorrectSelection = isSubmitted && isSelected && isFromList;
          const isMissedWord = isSubmitted && !isSelected && isFromList;

          let bgColor = 'transparent';
          let wordColor = '#36363f';

          if (isSubmitted) {
            if (isFromList) {
              wordColor = '#1dc198';
              if (isSelected) {
                bgColor = 'rgba(29, 193, 152, 0.15)';
              }
            } else {
              wordColor = '#36363f';
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
                padding: '10px 0',
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
                  }}
                >
                  {wordItem.english}
                </Typography>
              </Box>

              {/* Badges and Icons after submit */}
              {isSubmitted && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {/* Badge showing status */}
                  {isFromList && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1dc198',
                        backgroundColor: 'rgba(29, 193, 152, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ От списъка
                    </Typography>
                  )}
                  {!isFromList && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#999',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      ✗ Не е от списъка
                    </Typography>
                  )}

                  {/* Checkmark/X icon */}
                  {isCorrectSelection && (
                    <CheckCircleRoundedIcon sx={{ color: '#1dc198', fontSize: 24 }} />
                  )}
                  {isWrongSelection && (
                    <CancelRoundedIcon sx={{ color: '#ff397e', fontSize: 24 }} />
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default WordsFromYourList;
