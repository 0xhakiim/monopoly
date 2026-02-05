import React from 'react';
import type { Property } from '../types/monopoly';
import { cn } from '../lib/utils.ts';

interface BoardSpaceProps {
    space: Property;
    players: Array<{ id: number; color: string }>;
    position: 'bottom' | 'left' | 'top' | 'right';
    ownerColor?: string;
    onClick: () => void;
}

export const BoardSpace = ({ space, players, position, ownerColor, onClick }: BoardSpaceProps) => {
    const isCorner = space.type === 'corner';
    const containerClasses = cn(
        // 1. BASE STYLES: Every tile gets a border and a white background.
        "border border-black bg-white flex shrink-0 grow",

        // 2. DIMENSIONS: 
        // If top/bottom, it's a vertical rectangle. 
        // If left/right, it's a horizontal rectangle.
        (position === 'top' || position === 'bottom') ? "flex-col w-[72.72px]" : "flex-row h-[72.72px] w-full",

        // 3. DIRECTION:
        // We flip the flex order so the "Color Bar" always stays on the outside edge.
        position === 'top' && "flex-col-reverse",
        position === 'left' && "flex-row-reverse",

        // 4. SPECIAL CASE:
        // If it's a corner (Go, Jail, etc.), give it a fixed square size.
        isCorner && "w-[80px] h-[80px]"
    );
    const getColorClass = () => {
        if (!space.color) return '';
        const colorMap: Record<string, string> = {
            brown: 'bg-orange-900', // Tailored for standard Monopoly looks
            lightBlue: 'bg-blue-300',
            pink: 'bg-pink-500',
            orange: 'bg-orange-500',
            red: 'bg-red-600',
            yellow: 'bg-yellow-400',
            green: 'bg-green-600',
            darkBlue: 'bg-blue-800',
        };
        return colorMap[space.color] || '';
    };

    // Determine layout based on side of the board
    const getLayoutClasses = () => {
        switch (position) {
            case 'top': return 'flex-col-reverse'; // Color bar at bottom of top tiles
            case 'left': return 'flex-row-reverse'; // Color bar at right of left tiles
            case 'right': return 'flex-row'; // Color bar at left of right tiles
            default: return 'flex-col'; // Color bar at top of bottom tiles
        }
    };

    const renderPlayerPieces = () => {
        const playerColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"]; // Red, Blue, Green, Orange
        return players.map((p, idx) => {
            return (
                <div
                    key={p.id}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300"
                    style={{
                        backgroundColor: playerColors[p.id % playerColors.length],
                        transform: `translate(${idx * 4}px, ${idx * 2}px)`
                    }}
                    title={`Player ${p.id}`}
                />
            );
        });
    };

    return (
        <div className={cn(containerClasses, "cursor-pointer hover:brightness-95 transition-all")}
            onClick={onClick}>
            {/* COLOR BAR */}
            {space && !isCorner && (
                <div className={cn(
                    getColorClass(),
                    (position === 'top' || position === 'bottom') ? "h-1/4 w-full border-black" : "w-1/4 h-full border-black",
                    position === 'bottom' && "border-b",
                    position === 'top' && "border-t",
                    position === 'left' && "border-l",
                    position === 'right' && "border-r",
                )} />
            )}

            {/* CONTENT */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-1">
                {/* OWNERSHIP INDICATOR */}
                {ownerColor && (
                    <div
                        className="absolute top-0 right-0 w-3 h-3 border-l border-b border-black"
                        style={{ backgroundColor: ownerColor }}
                        title="Owned Property"
                    />
                )}

                <span className="text-[9px] font-bold text-center uppercase leading-none">{space.name}</span>
                {/* PLAYER TOKENS CONTAINER */}
                <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 pointer-events-none">
                    {players.map((p) => (
                        <div
                            key={p.id}
                            className="w-3 h-3 rounded-full border border-white shadow-md"
                            style={{ backgroundColor: p.id === 0 ? 'red' : 'blue' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};