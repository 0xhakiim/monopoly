import type { Player } from '@/types/monopoly';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { cn } from '@/lib/utils';

interface PlayerPanelProps {
  players: Player[];
  currentPlayerId: number;
}

export const PlayerPanel = ({ players = [], currentPlayerId = 0 }: PlayerPanelProps) => {
  console.log(players)
  return (<>{players &&
    <div className="flex flex-col gap-4">
      {players.map((player) => (
        <Card
          key={player.id}
          className={cn(
            'transition-all',
            player.id === currentPlayerId && ' ring-primary shadow-lg border-2 border-red-500',
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-card-foreground"
                  style={{ backgroundColor: player.color }}
                />
                {player.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Money:</span>
              <span className="font-bold text-game-gold">${player.money}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Properties:</span>
              {player && player.properties && <span className="font-semibold">{player.properties.length ?? 0}</span>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Position:</span>
              <span className="text-sm font-medium">{player.position}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>}</>
  );
};
