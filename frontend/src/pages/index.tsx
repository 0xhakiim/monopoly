import { useState } from 'react';

import { GameBoard } from '@/components/GameBoard';
import { DiceRoller } from '@/components/DiceRoller';
import { PlayerPanel } from '@/components/PlayerPanel';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/monopoly';
import { toast } from 'sonner';

const Index = () => {
    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: 'Player 1', money: 1500, position: 0, color: '#FF6B6B', properties: [] },
        { id: 2, name: 'Player 2', money: 1500, position: 0, color: '#4ECDC4', properties: [] },
        { id: 3, name: 'Player 3', money: 1500, position: 0, color: '#45B7D1', properties: [] },
        { id: 4, name: 'Player 4', money: 1500, position: 0, color: '#FFA07A', properties: [] },
    ]);

    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [currentRoll, setCurrentRoll] = useState<number[]>([0, 0]);

    const handleRoll = (dice: number[]) => {
        setCurrentRoll(dice);
        const total = dice[0] + dice[1];

        setPlayers(prev => prev.map((player, idx) => {
            if (idx === currentPlayer) {
                const newPosition = (player.position + total) % 40;
                toast.success(`${player.name} rolled ${total}! Moving to position ${newPosition}`);
                return { ...player, position: newPosition };
            }
            return player;
        }));
    };

    const endTurn = () => {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        setCurrentRoll([0, 0]);
        toast.info(`${players[(currentPlayer + 1) % players.length].name}'s turn`);
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-[1400px] mx-auto">

                <div className="flex gap-8 items-start justify-center">
                    {/* Left panel - Players */}
                    <div >
                        <PlayerPanel players={players} currentPlayerId={players[currentPlayer].id} />
                    </div>

                    {/* Center - Game Board */}
                    <div className="flex flex-col items-center gap-6">
                        <GameBoard players={players} />
                    </div>

                    {/* Right panel - Controls */}
                    <div className="w-64 space-y-4">
                        <div className="bg-card border-2 border-border rounded-lg p-6">
                            <h3 className="text-xl font-bold mb-4 text-center">Game Controls</h3>

                            <DiceRoller
                                onRoll={handleRoll}
                                disabled={currentRoll[0] > 0}
                                currentRoll={currentRoll}
                            />

                            <div className="mt-6 space-y-2">
                                <Button
                                    onClick={endTurn}
                                    disabled={currentRoll[0] === 0}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    End Turn
                                </Button>
                            </div>
                        </div>

                        <div className="bg-card border-2 border-border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Current Player</h4>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: players[currentPlayer].color }}
                                />
                                <span className="font-medium">{players[currentPlayer].name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
