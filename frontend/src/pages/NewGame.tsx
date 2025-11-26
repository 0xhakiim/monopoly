import useQueueSocket from "@/hooks/use-queueSocket";
import { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";






export const NewGame = () => {
    const { connected, sendAction, lastRawMessage } = useQueueSocket();
    const { id } = useParams<{ id: string }>();
    function joinQueue() {
        if (!connected) {
            console.warn("Not connected to queue socket");
            return;
        }

        sendAction({ action: "join", payload: { player_id: id } });
        setConn(true);

        console.log("Joined queue, waiting for game to start...");
    }
    let [conn, setConn] = useState(false);
    let navigate = useNavigate();
    useEffect(() => {
        if (!lastRawMessage) return;

        if (lastRawMessage.action === "match_found") {
            console.debug(lastRawMessage);
            const gameId = lastRawMessage.game_id;
            console.debug(gameId);
            navigate(`/game?gameId=${gameId}`);
        }
    }, [lastRawMessage, navigate]);
    return (
        <div>
            <h2>New Game Page</h2>
            <p>Set up a new game here.</p>
            <button onClick={joinQueue}>Start Game</button>
            {conn ? <p>Waiting for game to start...</p> : null}
            {lastRawMessage == "Game created" ? <p>Message from server: {JSON.stringify(lastRawMessage)}</p> : null}
            {conn ? <button onClick={() => { sendAction({ action: "leave", payload: {} }); setConn(false); }}>Leave Queue</button> : null}

        </div >
    );
}