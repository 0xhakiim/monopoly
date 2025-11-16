import { boardSpaces } from '../data/boardSpaces';
import { BoardSpace } from './BoardSpace';
import type { Player } from '../types/monopoly';

interface GameBoardProps {
    players: Player[];
}

export const GameBoard = ({ players = [{ id: 1, name: "", money: 1500, position: 0, color: "", properties: [] }] }: GameBoardProps) => {
    const bottomRow = boardSpaces.slice(0, 11);
    const leftColumn = boardSpaces.slice(11, 20);
    const topRow = boardSpaces.slice(20, 31).reverse();
    const rightColumn = boardSpaces.slice(31, 40).reverse();

    const getPlayersAtPosition = (position: number) => {
        return players
            .filter(p => p.position === position)
            .map(p => ({ id: p.id, color: p.color }));
    };

    return (
        <div className="relative w-[800px] h-[800px] bg-game-board border-8 border-game-boardBorder shadow-2xl">
            {/* Bottom row */}
            <div className="absolute bottom-0 left-0 right-0 flex">
                {bottomRow.map((space) => (
                    <BoardSpace
                        key={space.id}
                        space={space}
                        players={getPlayersAtPosition(space.id)}
                        position="bottom"
                    />
                ))}
            </div>

            {/* Left column */}
            <div className="absolute left-0 top-24 bottom-24 flex flex-col">
                {leftColumn.map((space) => (
                    <BoardSpace
                        key={space.id}
                        space={space}
                        players={getPlayersAtPosition(space.id)}
                        position="left"
                    />
                ))}
            </div>

            {/* Top row */}
            <div className="absolute top-0 left-0 right-0 flex">
                {topRow.map((space) => (
                    <BoardSpace
                        key={space.id}
                        space={space}
                        players={getPlayersAtPosition(space.id)}
                        position="top"
                    />
                ))}
            </div>

            {/* Right column */}
            <div className="absolute right-0 top-24 bottom-24 flex flex-col">
                {rightColumn.map((space) => (
                    <BoardSpace
                        key={space.id}
                        space={space}
                        players={getPlayersAtPosition(space.id)}
                        position="right"
                    />
                ))}
            </div>

            {/* Center area */}
            <div className="absolute inset-24 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary mb-4">MONOPOLY</h1>
                    <p className="text-xl text-muted-foreground">Classic Edition</p>
                </div>
            </div>
        </div>
    );
};
