import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  MatchPairsQuestion,
} from '../data/types';

interface PairResult {
  left: string;
  isCorrect: boolean;
  correctRight: string;
}

interface MatchPairsProps {
  question: MatchPairsQuestion;
  userPairings: Record<string, string>;
  onPairingsChange: (pairings: Record<string, string>) => void;
  isSubmitted: boolean;
  pairResults?: PairResult[];
}

const MatchPairs: React.FC<MatchPairsProps> = ({
  question,
  userPairings,
  onPairingsChange,
  isSubmitted,
  pairResults,
}) => {
  const [, setForceRender] = useState(0);

  const leftItems = question.pairs.map((p) => p.left);
  // Use shuffledRights for display order (not pairs order which is the answer key)
  const allRightItems = question.shuffledRights;

  // Pool = right items not yet paired
  const pairedRights = new Set(Object.values(userPairings));
  const pool = allRightItems.filter((r) => !pairedRights.has(r));

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || isSubmitted) return;

      const { source, destination, draggableId } = result;

      // Dragging from pool to a left-item slot
      if (source.droppableId === 'pool' && destination.droppableId.startsWith('slot-')) {
        const leftKey = destination.droppableId.replace('slot-', '');
        const rightValue = draggableId.replace('right-', '');

        const newPairings = { ...userPairings };
        // If slot already occupied, put old value back to pool
        newPairings[leftKey] = rightValue;
        onPairingsChange(newPairings);
      }
      // Dragging from slot back to pool
      else if (source.droppableId.startsWith('slot-') && destination.droppableId === 'pool') {
        const leftKey = source.droppableId.replace('slot-', '');
        const newPairings = { ...userPairings };
        delete newPairings[leftKey];
        onPairingsChange(newPairings);
      }
      // Dragging from slot to another slot
      else if (source.droppableId.startsWith('slot-') && destination.droppableId.startsWith('slot-')) {
        const fromLeft = source.droppableId.replace('slot-', '');
        const toLeft = destination.droppableId.replace('slot-', '');
        const rightValue = draggableId.replace('right-', '');

        const newPairings = { ...userPairings };
        // If destination already has something, swap
        const existingAtDest = newPairings[toLeft];
        if (existingAtDest) {
          newPairings[fromLeft] = existingAtDest;
        } else {
          delete newPairings[fromLeft];
        }
        newPairings[toLeft] = rightValue;
        onPairingsChange(newPairings);
      }

      setForceRender((n) => n + 1);
    },
    [userPairings, onPairingsChange, isSubmitted]
  );

  const handleClickRemove = (leftKey: string) => {
    if (isSubmitted) return;
    const newPairings = { ...userPairings };
    delete newPairings[leftKey];
    onPairingsChange(newPairings);
  };

  const getSlotBg = (leftKey: string): string => {
    if (!isSubmitted) {
      return userPairings[leftKey] ? '#dfeaff' : '#dbdbdb';
    }
    const result = pairResults?.find((r) => r.left === leftKey);
    if (!result) return '#dbdbdb';
    return result.isCorrect ? '#ccfdc5' : '#ffadad';
  };

  const title =
    question.variant === 'translation'
      ? 'Свържете думата на английски с превода на български'
      : 'Свържете двете части в правилна дума';

  return (
    <Box>
      <Typography
        variant="body1"
        sx={{ fontWeight: 700, color: '#36363f', mb: 2 }}
      >
        {title}
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Left items with drop slots */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {leftItems.map((left) => {
            const paired = userPairings[left];
            const result = pairResults?.find((r) => r.left === left);

            return (
              <Box
                key={left}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                {/* Left side */}
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #5a85de',
                    borderRadius: '20px 0 0 20px',
                    py: 1.5,
                    px: 2,
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#394da8',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: -12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 24,
                      height: 24,
                      backgroundColor: '#5a85de',
                      borderRadius: '50%',
                      zIndex: 1,
                    },
                  }}
                >
                  {left}
                </Box>

                {/* Right side drop zone */}
                <Droppable droppableId={`slot-${left}`}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      onClick={() => paired && handleClickRemove(left)}
                      sx={{
                        backgroundColor: snapshot.isDraggingOver
                          ? 'rgba(90, 133, 222, 0.15)'
                          : getSlotBg(left),
                        border: '1px dashed #5a85de',
                        borderRadius: '0 20px 20px 0',
                        py: 1.5,
                        px: 2,
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: paired && !isSubmitted ? 'pointer' : 'default',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {paired ? (
                        <Draggable
                          draggableId={`right-${paired}`}
                          index={0}
                          isDragDisabled={isSubmitted}
                        >
                          {(dragProvided) => (
                            <Box
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              sx={{
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#36363f',
                              }}
                            >
                              {paired}
                            </Box>
                          )}
                        </Draggable>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: '#aaa', fontStyle: 'italic' }}
                        >
                          Пуснете тук
                        </Typography>
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );

          })}
        </Box>

        {/* Pool of right items */}
        {!isSubmitted && pool.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#8c8c8c', fontWeight: 600, mb: 1, display: 'block' }}
            >
              Преместете отговорите:
            </Typography>
            <Droppable droppableId="pool" direction="horizontal">
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {pool.map((right, idx) => (
                    <Draggable
                      key={`right-${right}`}
                      draggableId={`right-${right}`}
                      index={idx}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <Box
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          sx={{
                            border: '1px solid #5a85de',
                            borderRadius: '10px',
                            py: 1,
                            px: 2,
                            backgroundColor: dragSnapshot.isDragging
                              ? '#dfeaff'
                              : '#fff',
                            fontWeight: 600,
                            fontSize: 15,
                            color: '#394da8',
                            cursor: 'grab',
                            userSelect: 'none',
                            transition: 'background-color 0.15s',
                            '&:hover': {
                              backgroundColor: '#f0f4ff',
                            },
                          }}
                        >
                          {right}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        )}

        {/* Show correct answers after submit */}
        {isSubmitted && pairResults && (
          <Box sx={{ mt: 2 }}>
            {pairResults
              .filter((r) => !r.isCorrect)
              .map((r) => (
                <Typography
                  key={r.left}
                  variant="body2"
                  sx={{ color: '#1dc198', fontWeight: 600, mb: 0.5 }}
                >
                  {r.left} → {r.correctRight}
                </Typography>
              ))}
          </Box>
        )}
      </DragDropContext>
    </Box>
  );
};

export function checkMatchPairsResult(
  question: MatchPairsQuestion,
  pairings: Record<string, string>
): PairResult[] {
  return question.pairs.map((pair) => ({
    left: pair.left,
    isCorrect: pairings[pair.left] === pair.right,
    correctRight: pair.right,
  }));
}

export default MatchPairs;
