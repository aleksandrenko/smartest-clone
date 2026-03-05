import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { ListenAndTypeQuestion } from '../data/types';

interface ListenAndTypeProps {
  question: ListenAndTypeQuestion;
  userInput: string;
  onInputChange: (value: string) => void;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const ListenAndType: React.FC<ListenAndTypeProps> = ({
  question,
  userInput,
  onInputChange,
  isSubmitted,
  isCorrect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(question.word.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Box>
      {/* Audio Player Pill */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#e8e8e8',
          borderRadius: '25px',
          padding: '8px 16px',
          width: 'fit-content',
          mb: 3,
        }}
      >
        <IconButton
          size="small"
          onClick={handlePlayAudio}
          sx={{
            color: '#394da8',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(57, 77, 168, 0.08)',
            },
          }}
        >
          {isPlaying ? (
            <PauseRoundedIcon fontSize="small" />
          ) : (
            <PlayArrowRoundedIcon fontSize="small" />
          )}
        </IconButton>
        <Typography variant="caption" sx={{ fontWeight: 500, color: '#36363f' }}>
          00:00/00:01
        </Typography>
      </Box>

      {/* Text Input Field */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          variant="filled"
          placeholder="Отговор..."
          value={userInput}
          onChange={(e) => !isSubmitted && onInputChange(e.target.value)}
          disabled={isSubmitted}
          autoComplete="off"
          sx={{
            '& .MuiFilledInput-root': {
              backgroundColor: '#fff',
              border: `1px solid ${
                isSubmitted
                  ? isCorrect
                    ? '#1dc198'
                    : '#ff397e'
                  : '#cedaf3'
              }`,
              borderRadius: '10px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              padding: '12px',
              '&::before, &::after': { display: 'none' },
              '&:hover': { backgroundColor: '#fff' },
              '&.Mui-focused': {
                backgroundColor: '#fff',
                border: '1px solid #1dc198',
              },
              '&.Mui-disabled': {
                backgroundColor: isCorrect
                  ? 'rgba(204, 253, 197, 0.3)'
                  : 'rgba(255, 173, 173, 0.15)',
              },
            },
          }}
        />

        {/* Show Correct Answer When Wrong */}
        {isSubmitted && !isCorrect && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#ff397e', fontWeight: 600 }}>
              Твоят отговор:{' '}
              <span style={{ textDecoration: 'line-through' }}>
                {userInput || '(празно)'}
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#1dc198', fontWeight: 700, mt: 0.5 }}
            >
              Правилен отговор: {question.word.english}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ListenAndType;
