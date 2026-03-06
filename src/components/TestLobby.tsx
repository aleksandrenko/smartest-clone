import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { TestConfig, TOTAL_QUESTIONS, TOTAL_POINTS } from '../data/types';
import { getTestHistory } from '../utils/testHistory';

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
            9× напиши думата • 9× правилно/грешно • 4× избери правилните •
            7× липсващи букви • 5× свържи двойки • 4× думи от списъка
        </Typography>
        </Box>

        {/* History */}
        {(() => {
          const history = getTestHistory();
          if (history.length === 0) return null;
          const last10 = history.slice(-10).reverse();
          const best = Math.max(...history.map((h) => h.percentage));
          const avg = Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length);
          return (
            <Box sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                <EmojiEventsRoundedIcon sx={{ color: '#ffb921', fontSize: 22 }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#36363f' }}>
                  История ({history.length} {history.length === 1 ? 'тест' : 'теста'})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1dc198' }}>{best}%</Typography>
                  <Typography variant="caption" sx={{ color: '#8c8c8c' }}>Най-добър</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#394da8' }}>{avg}%</Typography>
                  <Typography variant="caption" sx={{ color: '#8c8c8c' }}>Среден</Typography>
                </Box>
              </Box>
              <Box sx={{ maxHeight: 180, overflowY: 'auto', px: 1 }}>
                {last10.map((r, i) => {
                  const d = new Date(r.date);
                  const dateStr = d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const timeStr = d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
                  const color = r.percentage >= 70 ? '#1dc198' : r.percentage >= 40 ? '#ffb921' : '#ff397e';
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 0.6,
                        px: 1,
                        borderRadius: '8px',
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#8c8c8c', fontSize: 13 }}>
                        {dateStr} {timeStr}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#36363f', fontSize: 13 }}>
                          {r.earned}/{r.total}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color,
                            fontSize: 13,
                            minWidth: 40,
                            textAlign: 'right',
                          }}
                        >
                          {r.percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })()}
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
