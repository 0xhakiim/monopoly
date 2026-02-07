import useQueueSocket from "@/hooks/use-queueSocket";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";






export const NewGame = () => {
    const { connected, sendAction, lastRawMessage, closeConnection } = useQueueSocket();
    const { id } = useParams<{ id: string }>();
    const token = jwtDecode<{ user_id: number, exp: number }>(localStorage.getItem("access_token") ?? "");
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
            console.log("players!!!!!!!!!!!!!1", lastRawMessage.players)
            const token = jwtDecode<{ user_id: number, exp: number }>(localStorage.getItem("access_token") ?? "0");
            let id;
            for (let i of lastRawMessage.players) {
                if (i[0] === token.user_id) {
                    id = i[1].id;
                }
            }
            closeConnection();
            navigate(`/game?gameId=${gameId}&playerId=${id}`);
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