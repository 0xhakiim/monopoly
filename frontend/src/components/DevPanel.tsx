import React, { useState } from 'react';

const DevPanel = ({ gameId, players, currentPhase }: { gameId: string, players: any[], currentPhase: string }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id);
    const [isOpen, setIsOpen] = useState(false);
    const [propId, setPropId] = useState(0);

    const handleAddProperty = () => {
        sendUpdate({
            target: 'add_property',
            player_id: selectedPlayer,
            value: propId
        });
        console.log(`Adding property ${propId} to player ${selectedPlayer}`);
    };
    const sendUpdate = async (payload: { [key: string]: any }) => {
        try {
            await fetch(`http://localhost:8000/dev/${gameId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error("Dev Update Failed:", err);
        }
    };

    if (!isOpen) {
        return (
            <button
                style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
                onClick={() => setIsOpen(true)}
            >
                🛠 Open Dev Tools
            </button>
        );
    }

    return (
        <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>🚀 Dev Control</h3>
                <button onClick={() => setIsOpen(false)}>X</button>
            </div>

            <hr />

            {/* --- Player Manipulation --- */}
            <h4>Modify Player</h4>
            <select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer}>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
            </select>

            <div style={buttonGrid}>
                <button onClick={() => sendUpdate({ target: 'player', player_id: selectedPlayer, field: 'money', value: 5000 })}>
                    💰 Set $5000
                </button>
                <button onClick={() => sendUpdate({ target: 'player', player_id: selectedPlayer, field: 'position', value: 39 })}>
                    🏎 Go to Boardwalk
                </button>
                <button onClick={() => sendUpdate({ target: 'player', player_id: selectedPlayer, field: 'in_jail', value: true })}>
                    ⚖️ Send to Jail
                </button>
            </div>
            <hr />
            <h4>Add Property</h4>
            <div style={{ display: 'flex', gap: '5px' }}>
                <input
                    type="number"
                    min="0" max="39"
                    value={propId}
                    onChange={(e) => setPropId(parseInt(e.target.value) || 0)}
                    style={{ width: '60px', background: '#333', color: '#fff', border: '1px solid #555' }}
                />
                <button onClick={handleAddProperty} style={{ flex: 1 }}>
                    Give Property {propId}
                </button>
            </div>
            <hr />

            {/* --- Game State Manipulation --- */}
            <h4>Game State (Current: {currentPhase})</h4>
            <div style={buttonGrid}>
                <button onClick={() => sendUpdate({ target: 'game', field: 'phase', value: 'WAIT_FOR_ROLL' })}>
                    Reset to Roll
                </button>
                <button onClick={() => sendUpdate({ target: 'game', field: 'phase', value: 'AUCTION' })}>
                    Force Auction
                </button>
                <button onClick={() => {
                    const nextIdx = (players.findIndex(p => p.id === selectedPlayer) + 1) % players.length;
                    sendUpdate({ target: 'game', field: 'turn_index', value: nextIdx });
                }}>
                    ⏭ Skip Turn
                </button>
            </div>
        </div>
    );
};

// Quick Styles
const panelStyle = {
    position: 'fixed', bottom: 20, right: 20, width: '300px',
    background: '#222', color: '#fff', padding: '15px',
    borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 9999,
    fontSize: '12px'
};

const buttonGrid = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '10px'
};

export default DevPanel;