import { useEffect, useRef, useState, useCallback } from "react";
import type { GameState } from "@/types/monopoly";
import { jwtDecode } from "jwt-decode";
type WSMessage = {
    action: string;
    payload?: any;
};

type UseGameSocketReturn = {
    connected: boolean;
    sendAction: (message: WSMessage) => void;
    lastRawMessage: any | null;
    gameState: GameState | null;
};

const defaultBase = (import.meta.env.DEV ? "ws://localhost:8000" : (window.location.origin.startsWith("https") ? "wss://" : "ws://") + window.location.host);

/**
 * useGameSocket
 * - Connects two WebSocket endpoints:
 *   1) /ws/game/{gameId}?player_id={playerId}  -> registers this client to the game's connections and receives broadcasts
 *   2) /ws/game/{gameId}/action                 -> used for sending actions (roll dice, move, etc.) and receiving direct action responses
 *
 * Usage:
 * const { connected, sendAction, lastRawMessage, gameState } = useGameSocket(gameId, playerId);
 */
export function useGameSocket(gameId?: string, playerId?: number, onChatMessage?: (msg: any) => void, baseUrl: string = defaultBase): UseGameSocketReturn {
    const [connected, setConnected] = useState(false);
    const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);
    const [gameState, setGameState] = useState<any | null>(null);

    const registerWsRef = useRef<WebSocket | null>(null);
    const actionWsRef = useRef<WebSocket | null>(null);

    // Helper to parse incoming message (JSON or text)
    const handleIncoming = useCallback((raw: MessageEvent) => {
        let parsed: any = raw.data;
        console.debug(parsed);
        try {
            parsed = JSON.parse(raw.data);
        } catch (e) {
            // leave as text if JSON parse fails
            console.error("Failed to parse WS message as JSON", e);
        }
        // 1. Check if it's a chat message
        if (parsed && parsed.type === "chat_message") {
            if (onChatMessage) onChatMessage(parsed.data);
            return; // Stop here, don't try to parse as game state
        }
        console.debug(parsed);
        setLastRawMessage(parsed);

        // If this is a game state broadcast, update gameState
        if (parsed && parsed.state) {
            console.log("Updating game state from WS message", parsed.state);
            setGameState(parsed.state);
        }

        // If backend uses other shapes (dice result etc.), caller can inspect lastRawMessage
    }, []);

    useEffect(() => {
        console.log("iterate")
        if (!gameId) return;
        const token = localStorage.getItem("access_token");
        let dec: { user_id: number, exp: number } = { user_id: 0, exp: 0 };
        if (token) {
            dec = jwtDecode(token);
        }

        // Open register socket (to be added to game.connections on backend)
        const registerUrl = `${baseUrl.replace(/^http/, "ws")}/ws/game/${gameId}?token=${token}&player_id=${dec.user_id}`;
        const registerWs = new WebSocket(registerUrl);
        registerWsRef.current = registerWs;

        registerWs.onopen = () => {
            console.debug("[ws/register] connected", registerUrl);
            setConnected(prev => true);
        };
        registerWs.onmessage = (ev) => {
            console.debug("[ws/register] message", ev.data);
            handleIncoming(ev);
        };
        registerWs.onclose = () => {
            console.debug("[ws/register] closed");
            setConnected(false);
            registerWsRef.current = null;
        };
        registerWs.onerror = (err) => {
            console.error("[ws/register] error", err);
        };

        // Open action socket
        const actionUrl = `${baseUrl.replace(/^http/, "ws")}/ws/game/${gameId}`;
        const actionWs = registerWs;
        actionWsRef.current = actionWs;

        actionWs.onopen = () => {
            console.debug("[ws/action] connected", actionUrl);
            setConnected(prev => true);
        };
        actionWs.onmessage = (ev) => {
            console.debug("[ws/action] message", ev.data);
            handleIncoming(ev);
        };
        actionWs.onclose = () => {
            console.debug("[ws/action] closed");
            setConnected(false);
            actionWsRef.current = null;
        };
        actionWs.onerror = (err) => {
            console.error("[ws/action] error", err);
        };

        // Cleanup on unmount or gameId change
        return () => {
            try { registerWs.close(); } catch (e) { }
            try { actionWs.close(); } catch (e) { }
            registerWsRef.current = null;
            actionWsRef.current = null;
            setConnected(false);
        };
    }, [gameId, playerId, baseUrl, handleIncoming]);

    const sendAction = useCallback((message: WSMessage) => {
        const ws = actionWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn("Action socket not open, cannot send action", message);
            return;
        }
        try {
            ws.send(JSON.stringify(message));
        } catch (e) {
            console.error("Failed to send action", e);
        }
    }, []);

    return {
        connected,
        sendAction,
        lastRawMessage,
        gameState,
    };
}