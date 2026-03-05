import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { useTestSession } from './hooks/useTestSession';
import { TestConfig } from './data/types';
import TestLobby from './components/TestLobby';
import TestSession from './components/TestSession';

const App: React.FC = () => {
  const session = useTestSession();

  const handleStart = (config: TestConfig) => {
    session.startTest(config);
  };

  const isTestActive = session.questions.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isTestActive ? (
        <TestLobby onStart={handleStart} />
      ) : (
        <TestSession
          questions={session.questions}
          answers={session.answers}
          isSubmitted={session.isSubmitted}
          totalEarned={session.totalEarned}
          timerSeconds={session.timerSeconds}
          totalQuestions={session.totalQuestions}
          totalPoints={session.totalPoints}
          unansweredCount={session.unansweredCount}
          onUpdateAnswer={session.updateAnswer}
          onSubmit={session.submitTest}
          onReset={session.resetTest}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
