import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface DiceRollerProps {
  onRoll: (dice: number[]) => void;
  disabled: boolean;
  currentRoll: number[];

}

export const DiceRoller = ({ onRoll, disabled, currentRoll }: DiceRollerProps) => {
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);

    // Animate dice roll
    const rollInterval = setInterval(() => {
      const dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      setIsRolling(false);
      onRoll(finalDice);
    }, 1000);
  };

  const getDiceFace = (value: number) => {
    const dots: Record<number, number[][]> = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    return (
      <div className="w-16 h-16 bg-game-dice border-2 border-foreground rounded-lg grid grid-cols-3 grid-rows-3 gap-1 p-2 shadow-lg">
        {Array.from({ length: 9 }).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const shouldShow = dots[value]?.some(([r, c]) => r === row && c === col);
          return (
            <div
              key={idx}
              className={cn(
                'rounded-full transition-all',
                shouldShow ? 'bg-foreground' : 'bg-transparent'
              )}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {currentRoll.map((die, idx) => (
          <div
            key={idx}
            className={cn(
              'transition-transform duration-200',
              isRolling && 'animate-spin'
            )}
          >
            {getDiceFace(die)}
          </div>
        ))}
      </div>

      <Button
        onClick={rollDice}
        disabled={disabled || isRolling}
        size="lg"
        className="font-bold"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </Button>

      {currentRoll[0] > 0 && (
        <p className="text-lg font-semibold">
          Total: {currentRoll[0] + currentRoll[1]}
        </p>
      )}
    </div>
  );
};
