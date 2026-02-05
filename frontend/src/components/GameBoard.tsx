import { boardSpaces } from '../data/boardSpaces';
import { BoardSpace } from '@/components/BoardSpace';
import type { Player } from '../types/monopoly';

import { useState, useEffect, useMemo } from 'react';


interface GameBoardProps {
    players: Player[];
    onSelectSpace: (spaceId: number) => void;
}
export const GameBoard = ({ players = [], onSelectSpace }: GameBoardProps) => {
    // Map property IDs to owner colors for quick lookup
    const propertyOwners = useMemo(() => {
        const owners: Record<number, string> = {};
        players.forEach(p => {
            p.properties.forEach(propId => {
                owners[propId] = p.color;
            });
        });
        return owners;
    }, [players]);
    const renderSpace = (space: any, position: any) => (
        <BoardSpace
            key={space.id}
            space={space}
            players={getPlayersAtPosition(space.id)}
            position={position}
            ownerColor={propertyOwners[space.id]} // Pass owner color
            onClick={() => onSelectSpace(space.id)} // Pass click handler
        />
    );
    // Group the spaces
    const bottomRow = boardSpaces.slice(0, 11).reverse(); // 10 to 0
    const leftColumn = boardSpaces.slice(11, 20).reverse(); // 19 to 11
    const topRow = boardSpaces.slice(20, 31); // 20 to 30
    const rightColumn = boardSpaces.slice(31, 40); // 31 to 39
    function getPlayersAtPosition(position: number) {
        return players.filter(player => player.position === position).map(p => ({ id: p.id, color: p.color }));
    }
    return (
        <div className="relative w-[800px] h-[800px] bg-[#bfdbfe] border-2 border-black grid grid-cols-[repeat(11,1fr)] grid-rows-[repeat(11,1fr)]">

            {/* CENTER SPACE (Logo/Cards) */}
            <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex items-center justify-center bg-[#000000] border-2 border-black relative">
                <h1 className="text-6xl font-black rotate-[-45deg] opacity-20">MONOPOLY</h1>
            </div>

            {/* TOP ROW (20-30) */}
            <div className="col-start-1 col-end-12 row-start-1 flex text-black">
                {topRow.map((space) => renderSpace(space, "top"))}
            </div>

            {/* BOTTOM ROW (10-0) */}
            <div className="col-start-1 col-end-12 row-start-11 flex flex-row-reverse text-black">
                {bottomRow.map((space) => renderSpace(space, "bottom"))}
            </div>

            {/* LEFT COLUMN (11-19) */}
            <div className="col-start-1 row-start-2 row-end-11 flex flex-col-reverse text-black">
                {leftColumn.map((space) => renderSpace(space, "left"))}
            </div>

            {/* RIGHT COLUMN (31-39) */}
            <div className="col-start-11 row-start-2 row-end-11 flex flex-col text-black">
                {rightColumn.map((space) => renderSpace(space, "right"))}
            </div>
        </div>
    );
};