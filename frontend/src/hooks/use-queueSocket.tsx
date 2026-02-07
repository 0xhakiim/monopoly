import { useEffect, useRef, useState, useCallback } from "react";

type WSMessage = {
    action: string;
    payload?: any;
};

type UseGameSocketReturn = {
    connected: boolean;
    sendAction: (message: WSMessage) => void;
    lastRawMessage: any | null;
    closeConnection: () => void;
};

// Default base (already WS-safe)
const defaultBase =
    (import.meta.env.DEV
        ? "ws://localhost:8000"
        : (window.location.origin.startsWith("https") ? "wss://" : "ws://") +
        window.location.host);

export default function useQueueSocket(
    baseUrl: string = defaultBase
): UseGameSocketReturn {
    const [connected, setConnected] = useState(false);
    const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);

    const wsRef = useRef<WebSocket | null>(null);

    // Internal message parser
    const handleIncoming = useCallback((ev: MessageEvent) => {
        let parsed = ev.data;
        try {
            parsed = JSON.parse(ev.data);
        } catch (_) { }
        setLastRawMessage(parsed);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const url = `${baseUrl}/ws/matchmaking?token=${token}`;
        const ws = new WebSocket(url);

        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = handleIncoming;

        ws.onclose = () => {
            setConnected(false);
            wsRef.current = null;
        };

        ws.onerror = (err) => {
            console.error("Queue websocket error:", err);
        };
        console.log("iterate")
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };

    }, [baseUrl, handleIncoming]);

    const sendAction = useCallback((msg: WSMessage) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(JSON.stringify(msg));
    }, []);

    const closeConnection = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);
    return {
        connected,
        sendAction,
        lastRawMessage,
        closeConnection
    };
}
