import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { MissingLettersQuestion } from '../data/types';

interface MissingLettersProps {
  question: MissingLettersQuestion;
  filledLetters: Record<number, string>;
  onLetterChange: (index: number, value: string) => void;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const MissingLetters: React.FC<MissingLettersProps> = ({
  question,
  filledLetters,
  onLetterChange,
  isSubmitted,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [imageError, setImageError] = React.useState(false);

  const word = question.word.english;
  const blankSet = new Set(question.blankIndices);

  // Map blank positions to sequential input indices for ref management
  const blankPositionToInputIndex = new Map<number, number>();
  let inputIdx = 0;
  for (let i = 0; i < word.length; i++) {
    if (blankSet.has(i)) {
      blankPositionToInputIndex.set(i, inputIdx);
      inputIdx++;
    }
  }

  const handleInputChange = (
    blankPos: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.toUpperCase().slice(-1);
    onLetterChange(blankPos, value);

    // Auto-advance to next blank
    if (value) {
      const currentInputIdx = blankPositionToInputIndex.get(blankPos) ?? 0;
      setTimeout(() => {
        inputRefs.current[currentInputIdx + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (
    blankPos: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const currentInputIdx = blankPositionToInputIndex.get(blankPos) ?? 0;

    if (event.key === 'Backspace') {
      if (!filledLetters[blankPos] && currentInputIdx > 0) {
        event.preventDefault();
        inputRefs.current[currentInputIdx - 1]?.focus();
      }
    } else if (event.key === 'ArrowRight' && currentInputIdx < question.blankIndices.length - 1) {
      event.preventDefault();
      inputRefs.current[currentInputIdx + 1]?.focus();
    } else if (event.key === 'ArrowLeft' && currentInputIdx > 0) {
      event.preventDefault();
      inputRefs.current[currentInputIdx - 1]?.focus();
    }
  };

  const renderWord = () => {
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < word.length; i++) {
      if (blankSet.has(i)) {
        // This is a blank position — render input
        const inputIndex = blankPositionToInputIndex.get(i) ?? 0;
        const filled = filledLetters[i] ?? '';
        const expected = word[i].toUpperCase();
        const isWrong = isSubmitted && filled && filled.toUpperCase() !== expected;
        const isRight = isSubmitted && filled && filled.toUpperCase() === expected;
        const isEmpty = isSubmitted && !filled;

        elements.push(
          <Box
            key={`blank-${i}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <input
              ref={(el) => {
                inputRefs.current[inputIndex] = el;
              }}
              type="text"
              value={filled}
              onChange={(e) => handleInputChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              disabled={isSubmitted}
              style={{
                width: '40px',
                height: '40px',
                fontSize: '28px',
                fontWeight: 800,
                fontFamily: 'Nunito, sans-serif',
                textAlign: 'center',
                border: 'none',
                borderBottom: `3px solid ${
                  isWrong || isEmpty ? '#ff397e' : isRight ? '#1dc198' : '#394da8'
                }`,
                backgroundColor: 'transparent',
                color: isWrong || isEmpty ? '#ff397e' : isRight ? '#1dc198' : '#394da8',
                outline: 'none',
                padding: '0',
                cursor: isSubmitted ? 'default' : 'text',
              }}
            />
            {isSubmitted && (isWrong || isEmpty) && (
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#1dc198',
                  marginTop: '4px',
                  fontWeight: 600,
                }}
              >
                {expected}
              </Typography>
            )}
          </Box>
        );
      } else {
        // Known letter — display it
        elements.push(
          <Typography
            key={`char-${i}`}
            sx={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#394da8',
              fontFamily: 'Nunito, sans-serif',
              lineHeight: '40px',
            }}
          >
            {word[i].toUpperCase()}
          </Typography>
        );
      }
    }

    return elements;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Image */}
      {question.imageUrl && !imageError && (
        <Box
          component="img"
          src={question.imageUrl}
          alt={question.word.bulgarian}
          onError={() => setImageError(true)}
          sx={{
            borderRadius: '12px',
            maxWidth: '300px',
            display: 'block',
            margin: '0 auto 16px',
            width: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Bulgarian hint */}
      <Typography
        sx={{
          fontSize: '15px',
          color: '#8c8c8c',
          textAlign: 'center',
          mb: 2,
          fontWeight: 600,
        }}
      >
        ({question.word.bulgarian})
      </Typography>

      {/* Word with blanks */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginTop: '8px',
        }}
      >
        {renderWord()}
      </Box>
    </Box>
  );
};

export default MissingLetters;
