import { boardSpaces } from '../data/boardSpaces';
import { BoardSpace } from '@/components/BoardSpace';
import type { Player } from '../types/monopoly';

import { useState, useEffect, useMemo } from 'react';


interface GameBoardProps {
    players: Player[];
}
export const GameBoard = ({ players = [] }: GameBoardProps) => {
    const getIconForType = (space: typeof boardSpaces[0]) => {
        switch (space.type) {
            case 'railroad':
                return '🚂';
            case 'utility':
                return space.name.includes('Electric') ? '💡' : '💧';
            case 'chance':
                return '❓';
            case 'community':
                return '👥';
            case 'tax':
                return '💸';
            default:
                return '';
        }
    };
    let positions = [];
    for (let i of players) {
        positions.push(i.position);
    }
    const bottomRow = boardSpaces.slice(0, 11);
    const leftColumn = boardSpaces.slice(11, 20);
    const topRow = boardSpaces.slice(20, 31).reverse();
    const rightColumn = boardSpaces.slice(31, 40).reverse();





    const getPlayersAtPosition = (pos: number) => {
        // If backend provides a GameState, try to use it.
        if (positions) {
            const idsAtPos = Object.entries(positions)
                .filter(([, p]) => p === pos)
                .map(([pid]) => Number(pid));
            return players.filter((p) => idsAtPos.includes(p.id));
        }
        // fallback: local players prop
        return players.filter((p) => p.position === pos);
    };
    return (
        <div className="relative w-[800px] h-[800px] bg-game-board border-8 border-game-boardBorder shadow-2xl">


            {/* Board layout (existing rendering) */}
            <div className="absolute bottom-0 left-0 right-0 flex">
                {bottomRow.map((space) => (console.log(space),
                    <BoardSpace key={space.id} space={space} players={getPlayersAtPosition(space.id)} position="bottom" />
                ))}
            </div>

            <div className="absolute left-0 top-24 bottom-24 flex flex-col">
                {leftColumn.map((space) => (
                    <BoardSpace key={space.id} space={space} players={getPlayersAtPosition(space.id)} position="left" />
                ))}
            </div>

            <div className="absolute top-0 left-0 right-0 flex">
                {topRow.map((space) => (
                    <BoardSpace key={space.id} space={space} players={getPlayersAtPosition(space.id)} position="top" />
                ))}
            </div>

            <div className="absolute right-0 top-24 bottom-24 flex flex-col">
                {rightColumn.map((space) => (
                    <BoardSpace key={space.id} space={space} players={getPlayersAtPosition(space.id)} position="right" />
                ))}
            </div>
        </div>
    );
};
