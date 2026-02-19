import React from 'react';
import type { Property } from '../types/monopoly';

interface BoardSpaceProps {
    space: Property;
    players: Array<{ id: number; color: string }>;
    position: 'bottom' | 'left' | 'top' | 'right';
    ownerColor?: string;
    onClick: () => void;
}

const COLOR_MAP: Record<string, string> = {
    brown: '#92400e',
    lightBlue: '#7dd3fc',
    pink: '#f472b6',
    orange: '#f97316',
    red: '#dc2626',
    yellow: '#facc15',
    green: '#16a34a',
    darkBlue: '#1d4ed8',
};

const PLAYER_TOKEN_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777'];

export const BoardSpace = ({ space, players, position, ownerColor, onClick }: BoardSpaceProps) => {
    const isCorner = space.type === 'corner';
    const isTop = position === 'top';
    const isBottom = position === 'bottom';
    const isLeft = position === 'left';
    const isRight = position === 'right';
    const isVertical = isTop || isBottom;

    // ── Container style ──────────────────────────────────────────────────────
    // GameBoard wraps each tile in a correctly-sized div.
    // BoardSpace just needs to fill that wrapper 100% and arrange its internals.
    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isTop
            ? 'column-reverse'  // color bar at bottom (outer/top edge of board)
            : isBottom
                ? 'column'      // color bar at top (outer/bottom edge of board)
                : isLeft
                    ? 'row-reverse' // color bar at right (outer/left edge of board)
                    : 'row',        // color bar at left (outer/right edge of board)
        border: '1px solid #000',
        backgroundColor: '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        boxSizing: 'border-box',
    };

    // Color bar sits on the OUTSIDE edge of each tile face.
    // Because we use flex-reverse tricks, the bar is always rendered first in JSX
    // but visually ends up on the outer edge.
    const colorBarStyle: React.CSSProperties = {
        backgroundColor: space.color ? COLOR_MAP[space.color] : undefined,
        flexShrink: 0,
        ...(isVertical
            ? { width: '100%', height: '22%' }
            : { height: '100%', width: '22%' }),
        // Inner border (between color bar and content area)
        ...(isBottom && { borderBottom: '1px solid #000' }),
        ...(isTop && { borderTop: '1px solid #000' }),
        ...(isLeft && { borderLeft: '1px solid #000' }),
        ...(isRight && { borderRight: '1px solid #000' }),
    };

    // Text rotation: left column reads bottom→top, right column reads top→bottom
    const textRotation = isLeft ? 'rotate(90deg)' : isRight ? 'rotate(-90deg)' : undefined;

    return (
        <div
            onClick={onClick}
            style={containerStyle}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.93)')}
            onMouseLeave={e => (e.currentTarget.style.filter = '')}
        >
            {/* COLOR BAR */}
            {!isCorner && space.color && (
                <div style={colorBarStyle} />
            )}

            {/* CONTENT */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                gap: '2px',
                overflow: 'visible',
                position: 'relative',
            }}>
                {/* Ownership flag */}
                {ownerColor && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        backgroundColor: ownerColor,
                        borderLeft: '1px solid #000',
                        borderBottom: '1px solid #000',
                        zIndex: 10,
                    }} />
                )}

                {/* SIDE TILES: wrap name + price in a rotated container sized to tile height */}
                {(isLeft || isRight) ? (
                    <div style={{
                        // This box is 58px wide × ~80px tall BEFORE rotation.
                        // After rotation it becomes ~80px wide × 58px tall — fitting inside the tile.
                        width: '58px',
                        display: 'flex',
                        flexDirection: isLeft ? 'column' : 'column-reverse',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        transform: textRotation,
                        flexShrink: 0,
                    }}>
                        <span style={{
                            fontSize: '7.5px',
                            fontWeight: 700,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            color: '#111',
                            letterSpacing: '0.02em',
                            wordBreak: 'break-word',
                            width: '100%',
                        }}>
                            {space.name}
                        </span>
                        {space.price && (
                            <span style={{
                                fontSize: '7px',
                                fontWeight: 600,
                                color: '#6b7280',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                            }}>
                                ${space.price}
                            </span>
                        )}
                    </div>
                ) : (
                    <>
                        {/* TOP / BOTTOM tiles: price above name */}
                        {space.price && !isCorner && (
                            <span style={{
                                fontSize: '7px',
                                fontWeight: 600,
                                color: '#6b7280',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                            }}>
                                ${space.price}
                            </span>
                        )}
                        <span style={{
                            fontSize: isCorner ? '9px' : '7.5px',
                            fontWeight: 700,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            color: '#111',
                            letterSpacing: '0.02em',
                            wordBreak: 'break-word',
                        }}>
                            {space.name}
                        </span>
                    </>
                )}

                {/* Player tokens */}
                {players.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        marginTop: '2px',
                    }}>
                        {players.map(p => (
                            <div
                                key={p.id}
                                title={`Player ${p.id + 1}`}
                                style={{
                                    width: players.length > 2 ? 9 : 11,
                                    height: players.length > 2 ? 9 : 11,
                                    borderRadius: '50%',
                                    backgroundColor: PLAYER_TOKEN_COLORS[p.id % PLAYER_TOKEN_COLORS.length],
                                    border: '1.5px solid rgba(255,255,255,0.9)',
                                    boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};