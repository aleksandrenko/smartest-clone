import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { TestConfig, TOTAL_QUESTIONS, TOTAL_POINTS } from '../data/types';

interface TestLobbyProps {
  onStart: (config: TestConfig) => void;
}

const TestLobby: React.FC<TestLobbyProps> = ({ onStart }) => {
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(20);

  const handleStart = () => {
    onStart({
      timerMinutes: timerEnabled ? timerMinutes : null,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: 4,
          borderRadius: '20px',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, color: '#36363f' }}
        >
          🐝 Spelling Bee
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#394da8', mb: 1 }}
        >
          LEVel: JUNIOR 2026 — Mock Test
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#8c8c8c', mb: 3 }}
        >
          Регионален кръг • 400 думи
        </Typography>

        {/* Test info */}
        <Box
          sx={{
            backgroundColor: 'rgba(29,193,152,0.08)',
            borderRadius: '12px',
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#36363f', mb: 0.5 }}>
            {TOTAL_QUESTIONS} въпроса • {TOTAL_POINTS} точки
          </Typography>
          <Typography variant="body2" sx={{ color: '#8c8c8c', fontSize: 13 }}>
            7× напиши думата • 7× правилно/грешно • 1× избери правилните •
            5× липсващи букви • 2× свържи двойки • 1× думи от списъка
          </Typography>
        </Box>

        {/* Timer config */}
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          <FormControlLabel
            control={
              <Switch
                checked={timerEnabled}
                onChange={(_, checked) => setTimerEnabled(checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1dc198',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1dc198',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 600, color: '#36363f' }}>
                Таймер
              </Typography>
            }
          />

          {timerEnabled && (
            <Box sx={{ px: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#8c8c8c', mb: 1 }}>
                {timerMinutes} минути
              </Typography>
              <Slider
                value={timerMinutes}
                onChange={(_, val) => setTimerMinutes(val as number)}
                min={5}
                max={60}
                step={5}
                marks={[
                  { value: 5, label: '5' },
                  { value: 20, label: '20' },
                  { value: 40, label: '40' },
                  { value: 60, label: '60' },
                ]}
                sx={{
                  color: '#1dc198',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(29,193,152,0.16)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Start button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowRoundedIcon />}
          onClick={handleStart}
          sx={{
            backgroundColor: '#1dc198',
            '&:hover': { backgroundColor: '#17a583' },
            borderRadius: '25px',
            px: 6,
            py: 1.5,
            fontWeight: 700,
            fontSize: 18,
            width: '100%',
          }}
        >
          Започни теста
        </Button>
      </Paper>
    </Box>
  );
};

export default TestLobby;
