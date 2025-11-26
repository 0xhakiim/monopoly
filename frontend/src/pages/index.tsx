import { useState, useEffect } from 'react';

import { GameBoard } from '@/components/GameBoard';
import { DiceRoller } from '@/components/DiceRoller';
import { PlayerPanel } from '@/components/PlayerPanel';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/monopoly';
import { toast } from 'sonner';
import SideBar from '@/components/SideBar';
import { useGameSocket } from "@/hooks/use-gameSocket"; // new hook
interface GameBoardProps {
    players: Player[];
    gameId?: string;
    playerId?: number;
}
const Index = ({ players = [{ id: 1, name: "ac", money: 1500, position: 0, color: "", properties: [] }, { id: 2, name: "ab", money: 2500, position: 0, color: "", properties: [] }], gameId, playerId }: GameBoardProps) => {

    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [currentRoll, setCurrentRoll] = useState<number[]>([0, 0]);
    const [localGameId] = useState<string | undefined>(() => {
        if (gameId) return gameId;
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get("gameId") ?? undefined;
        } catch {
            return undefined;
        }
    });
    const [localPlayerId] = useState<number>(() => playerId ?? Number(new URLSearchParams(window.location.search).get("playerId") ?? 0));

    const [lastDice, setLastDice] = useState<number | null>(null);
    const { connected, sendAction, lastRawMessage, gameState } = useGameSocket(localGameId, localPlayerId);
    console.log(players);
    useEffect(() => {

        if (!lastRawMessage) return;
        // backend action endpoint sometimes returns { dice: result, new_position: result }
        if (typeof lastRawMessage === "object" && lastRawMessage.dice !== undefined) {
            setLastDice(lastRawMessage.new_position ?? lastRawMessage.dice);
            // Update local players positions if you want (here we just log)
            players[currentPlayer].position = lastDice ?? 0;
            setCurrentRoll(lastRawMessage.dice);
            console.debug("Dice result from server:", lastRawMessage);
        }

        // If backend sends plain text messages (matchmaking/game notifications), just log them
        if (typeof lastRawMessage === "string") {
            console.debug("Server text:", lastRawMessage);

        }

    }, [lastRawMessage]);
    const handleRoll = async () => {
        // send action to /ws/game/{id}/action
        sendAction({ action: "roll_dice" });
    };

    const endTurn = () => {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        setCurrentRoll([0, 0]);
        console.log(currentPlayer)
        toast.info(`${players[(currentPlayer + 1) % players.length].name}'s turn`);
    };

    return (
        <div className="min-h-screen  bg-background p-8">
            <div className="max-w-[1400px]  mx-auto">

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
