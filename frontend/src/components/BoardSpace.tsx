import type { Property } from '../types/monopoly';
import { cn } from '../lib/utils.ts';

interface BoardSpaceProps {
    space: Property;
    players: Array<{ id: number; color: string }>;
    position: 'bottom' | 'left' | 'top' | 'right';
}

export const BoardSpace = ({ space, players, position }: BoardSpaceProps) => {
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
                return '?';
            case 'community':
                return '📦';
            case 'tax':
                return '💰';
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                'relative bg-card border-2 border-game-boardBorder flex flex-col',
                isCorner ? 'w-24 h-24' : 'w-16 h-24',
                position === 'bottom' || position === 'top' ? 'flex-col' : 'flex-row',
            )}
        >
            {space.color && (
                <div className={cn('h-6', getColorClass())} />
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
                {getIconForType() && (
                    <span className="text-xl mb-1">{getIconForType()}</span>
                )}
                <p className="text-[0.65rem] font-semibold leading-tight">{space.name}</p>
                {space.price && (
                    <p className="text-[0.6rem] text-muted-foreground">${space.price}</p>
                )}
            </div>

            {players.length > 0 && (
                <div className="absolute bottom-1 left-1 flex gap-0.5">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className="w-3 h-3 rounded-full border-2 border-card"
                            style={{ backgroundColor: player.color }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};