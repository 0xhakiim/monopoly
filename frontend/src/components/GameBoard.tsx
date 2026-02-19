import { boardSpaces } from '../data/boardSpaces';
import { BoardSpace } from '@/components/BoardSpace';
import type { Player } from '../types/monopoly';
import { useMemo } from 'react';

interface GameBoardProps {
    players: Player[];
    onSelectSpace: (spaceId: number) => void;
}

export const GameBoard = ({ players = [], onSelectSpace }: GameBoardProps) => {
    // Map property IDs → owner player color for quick lookup
    const propertyOwners = useMemo(() => {
        const owners: Record<number, string> = {};
        players.forEach(p => {
            p.properties?.forEach(propId => {
                owners[propId] = p.color;
            });
        });
        return owners;
    }, [players]);

    const getPlayersAtPosition = (position: number) =>
        players
            .filter(player => player.position === position)
            .map(p => ({ id: p.id, color: p.color }));

    const renderSpace = (space: any, position: 'top' | 'bottom' | 'left' | 'right') => (
        <BoardSpace
            key={space.id}
            space={space}
            players={getPlayersAtPosition(space.id)}
            position={position}
            ownerColor={propertyOwners[space.id]}
            onClick={() => onSelectSpace(space.id)}
        />
    );

    // Standard Monopoly board layout (40 spaces, 0-indexed)
    // Space 0 = Go (bottom-right corner), going counter-clockwise
    const bottomRow = boardSpaces.slice(0, 11);   // spaces 0–10,  render right→left
    const leftColumn = boardSpaces.slice(11, 20);  // spaces 11–19, render bottom→top
    const topRow = boardSpaces.slice(20, 31);      // spaces 20–30, render left→right
    const rightColumn = boardSpaces.slice(31, 40); // spaces 31–39, render top→bottom

    // Board is 800px wide/tall.
    // Corner tiles: 80×80px
    // Side tiles: 9 tiles share (800 - 2×80) = 640px → each tile is 640/9 ≈ 71.11px
    const CORNER = 80;
    const SIDE = (800 - CORNER * 2) / 9; // ≈ 71.11px

    return (
        <div
            className="relative select-none"
            style={{
                width: '800px',
                height: '800px',
                position: 'relative',
                backgroundColor: '#c8e6c9',
                border: '4px solid #1b5e20',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 5px #2e7d32',
                fontFamily: "'Georgia', serif",
                boxSizing: 'border-box',
            }}
        >
            {/* ── CENTER PANEL ────────────────────────────────────────── */}
            <div style={{
                position: 'absolute',
                left: CORNER,
                top: CORNER,
                right: CORNER,
                bottom: CORNER,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 60%, #a5d6a7 100%)',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', width: '88%', height: '88%',
                    border: '2px solid rgba(27,94,32,0.12)', borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', width: '68%', height: '68%',
                    border: '1px solid rgba(27,94,32,0.08)', borderRadius: '50%',
                }} />
                <div style={{
                    fontSize: '54px', fontWeight: 900, letterSpacing: '-2px',
                    color: '#1b5e20', textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
                    lineHeight: 1, userSelect: 'none', fontFamily: "'Georgia', serif",
                }}>
                    MONOPOLY
                </div>
                <div style={{
                    fontSize: '10px', letterSpacing: '5px', color: '#388e3c',
                    marginTop: '8px', textTransform: 'uppercase', userSelect: 'none',
                }}>
                    The Classic Board Game
                </div>
                <div style={{
                    width: 22, height: 22, background: '#e53935',
                    transform: 'rotate(45deg)', marginTop: 24,
                    boxShadow: '0 2px 8px rgba(229,57,53,0.35)',
                }} />
            </div>

            {/* ── TOP ROW ─────────────────────────────────────────────── */}
            {/* Top-left corner (space 20) */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: CORNER, height: CORNER }}>
                {renderSpace(topRow[0], 'top')}
            </div>
            {/* Top middle tiles (spaces 21–29) */}
            <div style={{
                position: 'absolute', left: CORNER, top: 0,
                width: SIDE * 9, height: CORNER,
                display: 'flex', flexDirection: 'row',
            }}>
                {topRow.slice(1, 10).map(space => (
                    <div key={space.id} style={{ width: SIDE, height: CORNER, flexShrink: 0 }}>
                        {renderSpace(space, 'top')}
                    </div>
                ))}
            </div>
            {/* Top-right corner (space 30) */}
            <div style={{ position: 'absolute', right: 0, top: 0, width: CORNER, height: CORNER }}>
                {renderSpace(topRow[10], 'top')}
            </div>

            {/* ── BOTTOM ROW ──────────────────────────────────────────── */}
            {/* Bottom-right corner (space 0 = Go) */}
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: CORNER, height: CORNER }}>
                {renderSpace(bottomRow[0], 'bottom')}
            </div>
            {/* Bottom middle tiles (spaces 1–9), rendered right→left */}
            <div style={{
                position: 'absolute', left: CORNER, bottom: 0,
                width: SIDE * 9, height: CORNER,
                display: 'flex', flexDirection: 'row-reverse',
            }}>
                {bottomRow.slice(1, 10).map(space => (
                    <div key={space.id} style={{ width: SIDE, height: CORNER, flexShrink: 0 }}>
                        {renderSpace(space, 'bottom')}
                    </div>
                ))}
            </div>
            {/* Bottom-left corner (space 10 = Jail/Just Visiting) */}
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: CORNER, height: CORNER }}>
                {renderSpace(bottomRow[10], 'bottom')}
            </div>

            {/* ── LEFT COLUMN (spaces 11–19, bottom→top) ──────────────── */}
            <div style={{
                position: 'absolute', left: 0, top: CORNER,
                width: CORNER, height: SIDE * 9,
                display: 'flex', flexDirection: 'column-reverse',
            }}>
                {leftColumn.map(space => (
                    <div key={space.id} style={{ width: CORNER, height: SIDE, flexShrink: 0 }}>
                        {renderSpace(space, 'left')}
                    </div>
                ))}
            </div>

            {/* ── RIGHT COLUMN (spaces 31–39, top→bottom) ─────────────── */}
            <div style={{
                position: 'absolute', right: 0, top: CORNER,
                width: CORNER, height: SIDE * 9,
                display: 'flex', flexDirection: 'column',
            }}>
                {rightColumn.map(space => (
                    <div key={space.id} style={{ width: CORNER, height: SIDE, flexShrink: 0 }}>
                        {renderSpace(space, 'right')}
                    </div>
                ))}
            </div>
        </div>
    );
};