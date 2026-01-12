import React from 'react';
import type { Property } from '../types/monopoly';
import { cn } from '../lib/utils.ts';

interface BoardSpaceProps {
    space: Property;
    players: Array<{ id: number; color: string }>;
    position: 'bottom' | 'left' | 'top' | 'right';
}

export const BoardSpace = ({ space, players }: BoardSpaceProps) => {
    const isCorner = space.type === 'corner';

    const getColorClass = () => {
        if (!space.color) return '';
        const colorMap: Record<string, string> = {
            brown: 'bg-property-brown',
            lightBlue: 'bg-property-lightBlue',
            pink: 'bg-property-pink',
            orange: 'bg-property-orange',
            red: 'bg-property-red',
            yellow: 'bg-property-yellow',
            green: 'bg-property-green',
            darkBlue: 'bg-property-darkBlue',
        };
        return colorMap[space.color] || '';
    };

    const getIconForType = () => {
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
    const color = ["red", "blue"]
    // players: array of { id, color }
    // We'll render small circular pieces for each player in this tile.
    // To avoid pieces overlapping exactly we'll offset them slightly based on index.
    const renderPlayerPieces = () => {
        return players.map((p, idx) => {
            const offset = idx * 12; // horizontal offset in px
            // For vertical tiles (left/right) you might want different offsets; keep simple for now
            const style: React.CSSProperties = {
                left: `${8 + offset}px`,
                bottom: '8px',
                backgroundColor: color[p.id],
            };
            return (
                <div
                    key={p.id}
                    className="player-piece absolute w-4 h-4 rounded-full ring-2 ring-white transition-transform duration-200 ease-out"
                    style={style}
                    title={`Player ${p.id}`}
                />
            );
        });
    };

    return (
        <div
            className={cn(
                'relative flex flex-col font-extrabold  justify-center border border-border p-1 w-24 h-24'
                , isCorner ? 'w-24 h-24' : 'w-20 h-24',

            )}
        >
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
                <div className="text-xs text-center mt-2">{space.name}</div>
            </div>

            {/* pieces container */}
            <div className="absolute inset-0 pointer-events-none">
                {renderPlayerPieces()}
            </div>

            {/* optional icon */}
            <div className="z-10 ">{getIconForType()}</div>
        </div>
    );
};