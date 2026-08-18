import useQueueSocket from '@/hooks/use-queueSocket';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';

type JwtPayload = {
  user_id: number;
  exp: number;
};

export const NewGame = () => {
  const { connected, sendAction, lastRawMessage, closeConnection } = useQueueSocket();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conn, setConn] = useState(false);

  const token = (() => {
    const rawToken = localStorage.getItem('access_token');
    if (!rawToken) return null;

    try {
      return jwtDecode<JwtPayload>(rawToken);
    } catch {
      return null;
    }
  })();

  const resolvedPlayerId = Number(id ?? token?.user_id ?? 0);

  useEffect(() => {
    if (!token || !token.user_id) {
      navigate('/login', { replace: true });
      return;
    }

    if (!id && token.user_id) {
      navigate(`/newgame/${token.user_id}`, { replace: true });
      return;
    }

    if (id && Number(id) !== token.user_id) {
      navigate(`/newgame/${token.user_id}`, { replace: true });
    }
  }, [id, navigate, token]);

  function joinQueue() {
    if (!connected) {
      console.warn('Not connected to queue socket');
      return;
    }

    if (!token || !token.user_id) {
      navigate('/login', { replace: true });
      return;
    }

    sendAction({ action: 'join', payload: { player_id: resolvedPlayerId } });
    setConn(true);

    console.log('Joined queue, waiting for game to start...');
  }

  useEffect(() => {
    if (!lastRawMessage) return;

    if (lastRawMessage.action === 'match_found') {
      const gameId = lastRawMessage.game_id;
      const currentToken = (() => {
        const rawToken = localStorage.getItem('access_token');
        if (!rawToken) return null;

        try {
          return jwtDecode<JwtPayload>(rawToken);
        } catch {
          return null;
        }
      })();

      let playerId: number | undefined;
      for (const entry of lastRawMessage.players) {
        if (entry[0] === currentToken?.user_id) {
          playerId = entry[1].id;
        }
      }

      closeConnection();
      navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
    }
  }, [closeConnection, lastRawMessage, navigate]);

  return (
    <div>
      <h2>New Game Page</h2>
      <p>Set up a new game here.</p>
      <button onClick={joinQueue}>Start Game</button>
      {conn ? <p>Waiting for game to start...</p> : null}
      {lastRawMessage == 'Game created' ? <p>Message from server: {JSON.stringify(lastRawMessage)}</p> : null}
      {conn ? (
        <button
          onClick={() => {
            sendAction({ action: 'leave', payload: {} });
            setConn(false);
          }}
        >
          Leave Queue
        </button>
      ) : null}
    </div>
  );
};