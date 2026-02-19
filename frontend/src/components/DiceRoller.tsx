import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface DiceRollerProps {
  onRoll: (dice: number[]) => void;
  disabled: boolean;
  currentRoll: [number, number];
}

export const DiceRoller = ({ onRoll, disabled, currentRoll = [0, 0] }: DiceRollerProps) => {
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      setIsRolling(false);
      onRoll(finalDice);
    }, 800); // Slightly faster feel
  };

  const getDiceFace = (value: number) => {
    // Mapping pips to specific flex positions for a more natural look
    const pips = Array.from({ length: value });

    return (
      <div className={cn(
        "relative w-20 h-20 bg-white rounded-2xl p-3 shadow-[inset_0_-4px_0_rgba(0,0,0,0.1),0_8px_15px_rgba(0,0,0,0.2)] border-2 border-slate-200 flex items-center justify-center",
        "transition-all duration-300"
      )}>
        <div className={cn(
          "grid w-full h-full gap-1",
          value === 1 && "place-items-center",
          value === 2 && "grid-cols-2 justify-between",
          value === 3 && "grid-cols-3 items-center",
          value === 4 && "grid-cols-2 grid-rows-2",
          value === 5 && "grid-cols-3 grid-rows-3",
          value === 6 && "grid-cols-2 grid-rows-3"
        )}>
          {/* Custom pip placement logic for authenticity */}
          {value === 1 && <Pip className="col-start-2 row-start-2" />}
          {value === 2 && (
            <>
              <Pip className="self-start justify-self-start" />
              <Pip className="self-end justify-self-end" />
            </>
          )}
          {value === 3 && (
            <>
              <Pip className="self-start justify-self-start" />
              <Pip className="self-center justify-self-center" />
              <Pip className="self-end justify-self-end" />
            </>
          )}
          {value === 4 && (
            <>
              <Pip /><Pip /><Pip /><Pip />
            </>
          )}
          {value === 5 && (
            <>
              <Pip /><div /><Pip />
              <div /><Pip /><div />
              <Pip /><div /><Pip />
            </>
          )}
          {value === 6 && (
            <>
              <Pip /><Pip /><Pip /><Pip /><Pip /><Pip />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex gap-6 h-24 items-center">
        {currentRoll.map((die, idx) => (
          <div
            key={idx}
            className={cn(
              'transition-all duration-500 ease-out transform-gpu',
              isRolling ? 'animate-bounce rotate-[360deg] scale-110' : 'rotate-0 scale-100',
              die === 0 && 'opacity-20' // Faded state before first roll
            )}
          >
            {getDiceFace(die || 1)}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={rollDice}
          disabled={disabled || isRolling}
          size="lg"
          className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-700"
        >
          {isRolling ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">🎲</span> Rolling...
            </span>
          ) : (
            'Shake & Roll'
          )}
        </Button>

        {currentRoll[0] > 0 && !isRolling && (
          <div className="animate-in fade-in zoom-in duration-300">
            <span className="px-4 py-1 bg-white border border-slate-200 rounded-full text-slate-600 font-bold shadow-sm">
              Total: {currentRoll[0] + currentRoll[1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for the dots
const Pip = ({ className }: { className?: string }) => (
  <div className={cn("w-3.5 h-3.5 bg-slate-800 rounded-full shadow-[inset_0_2px_1px_rgba(0,0,0,0.4)]", className)} />
);