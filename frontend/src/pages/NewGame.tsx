<<<<<<< Updated upstream
import useQueueSocket from '@/hooks/use-queueSocket';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
=======
import useQueueSocket from "@/hooks/use-queueSocket";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Users, Settings, MessageSquare, LogOut,
    CarFront, Dog, Ship, Dice1, Dice5, Coins, Trophy,
    CheckCircle2, Clock, Hash, TrainTrack, Building2,
    BellRing
} from "lucide-react";


interface Lobby {
    lobby_id: string;
    players: [string];
    max_players: number;
    state: number;
    target_size: number;


}
>>>>>>> Stashed changes

type JwtPayload = {
  user_id: number;
  exp: number;
};

//lobby
export const NewGame = () => {
<<<<<<< Updated upstream
  const { connected, sendAction, lastRawMessage, closeConnection } = useQueueSocket();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conn, setConn] = useState(false);
=======
    const { connected, sendAction, lastRawMessage, closeConnection } = useQueueSocket();
    const { id } = useParams<{ id: string }>();
    const token = jwtDecode<{ user_id: number, exp: number }>(localStorage.getItem("access_token") ?? "");
    const playersInLobby = [];
    function joinQueue() {
        if (!connected) {
            console.warn("Not connected to queue socket");
            return;
        }
>>>>>>> Stashed changes

  const token = (() => {
    const rawToken = localStorage.getItem('access_token');
    if (!rawToken) return null;

    try {
      return jwtDecode<JwtPayload>(rawToken);
    } catch {
      return null;
    }
<<<<<<< Updated upstream
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
=======
    let [conn, setConn] = useState(false);
    let navigate = useNavigate();
    const [lobby, setLobby] = useState({ lobby_id: "", players: [], max_players: 4, state: 0, target_size: 0 } as unknown as Lobby);
    const [isReady, setIsReady] = useState(false);
    const [houseRules, setHouseRules] = useState({
        freeParking: true,
        goSalary: false,
        noRentInJail: false,
        auctions: true
    });
    const [pendingExpanded, setPendingExpanded] = useState(true);
    useEffect(() => {
        if (!lastRawMessage) return;
        if (lastRawMessage.message === "queued") {

        }
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
        <div className="min-h-screen min-w-full bg-[#1B5E20] flex flex-col font-sans overflow-hidden h-screen w-[1440px] max-w-full mx-auto relative shadow-2xl">
            {/* Decorative background board pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#F5ECD5 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Header */}
            <header className="relative z-10 bg-[#144718] border-b-4 border-[#0F3612] text-white px-6 py-4 flex items-center justify-between shadow-xl shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E3000F] text-white font-bold px-3 py-1.5 rounded-sm border-2 border-white/20 shadow-inner flex items-center gap-2 transform -rotate-2">
                            <Building2 className="w-5 h-5" />
                            <span className="tracking-wider text-sm font-['Playfair_Display']">PROPERTIES</span>
                        </div>
                        <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-wider text-white drop-shadow-md">
                            MONOPOLY
                        </h1>
                    </div>

                    <div className="h-8 w-px bg-white/20 mx-2" />

                    <div className="flex flex-col">
                        <span className="text-xs text-[#A5D6A7] font-semibold uppercase tracking-wider">Lobby Code</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold font-mono tracking-widest text-[#F5ECD5]">#BRDWLK</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-[#A5D6A7] hover:text-white hover:bg-white/10">
                                <Hash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-[#A5D6A7] hover:text-white hover:bg-white/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave Lobby
                    </Button>
                    <Button
                        size="lg"
                        disabled={!isReady}
                        className={`font-bold tracking-wide text-lg shadow-lg border-2 border-transparent transition-all duration-300 ${isReady
                            ? 'bg-[#E3000F] hover:bg-[#C9000D] text-white hover:scale-105 border-white/20'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                            }`}
                    >
                        START GAME
                        <Dice5 className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex p-6 gap-6 overflow-hidden">

                {/* Left/Center: Players Area */}
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                    <div className="flex items-center justify-between bg-[#0F3612]/40 rounded-xl p-4 border border-white/10 shrink-0 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#F5ECD5] p-2 rounded-lg text-[#1B5E20] shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Playfair_Display'] text-white tracking-wide">Players</h2>
                                <p className="text-[#A5D6A7] text-sm font-medium">Waiting for host to start...</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-[#F5ECD5]/10 text-[#F5ECD5] border-[#F5ECD5]/20 px-3 py-1 font-semibold tracking-wide">
                                4 / 5 Players
                            </Badge>
                            <Badge variant="outline" className="bg-[#E3000F]/20 text-[#FFCDD2] border-[#E3000F]/30 px-3 py-1 font-semibold tracking-wide">
                                2 Ready
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-y-auto pb-2 flex-1 items-start content-start pr-2 custom-scrollbar">
                        {/* Player 1 (Current User) */}
                        <div className={`relative group flex flex-col bg-[#F5ECD5] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${isReady ? 'ring-4 ring-[#4CAF50] ring-offset-4 ring-offset-[#1B5E20]' : 'ring-4 ring-[#E3000F] ring-offset-4 ring-offset-[#1B5E20]'}`}>
                            <div className={`h-3 w-full ${isReady ? 'bg-[#4CAF50]' : 'bg-[#E3000F]'}`} />

                            <div className="p-5 flex-1 flex flex-col items-center text-center gap-4 relative">
                                {isReady && (
                                    <div className="absolute top-3 right-3 text-[#4CAF50]">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                )}

                                <div className="w-20 h-20 rounded-full bg-[#1B5E20] border-4 border-[#0F3612] flex items-center justify-center text-[#F5ECD5] shadow-inner mt-2">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-2 bg-[#F5ECD5] rounded-t-md relative top-[1px]"></div>
                                        <div className="w-12 h-6 bg-[#F5ECD5] rounded-t-sm"></div>
                                        <div className="w-16 h-2 bg-[#F5ECD5] rounded-full"></div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-2xl font-['Playfair_Display'] text-[#0F3612]">Alex K.</h3>
                                    <p className="text-[#1B5E20] font-medium text-sm mt-1 uppercase tracking-widest flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-black"></span>
                                        Top Hat
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 w-full">
                                    <Button
                                        onClick={() => setIsReady(!isReady)}
                                        className={`w-full font-bold shadow-md transition-colors border-2 ${isReady
                                            ? 'bg-[#4CAF50] hover:bg-[#388E3C] text-white border-transparent'
                                            : 'bg-[#E3000F] hover:bg-[#C9000D] text-white border-transparent'
                                            }`}
                                    >
                                        {isReady ? 'READY' : 'MARK AS READY'}
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-[#EAE0C8] px-4 py-2 text-xs text-center text-[#1B5E20] font-bold tracking-widest border-t border-[#D5CAA8]">
                                YOU (HOST)
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div className="relative flex flex-col bg-[#F5ECD5] rounded-xl overflow-hidden shadow-xl ring-4 ring-[#4CAF50] ring-offset-4 ring-offset-[#1B5E20] opacity-90 hover:opacity-100 transition-opacity">
                            <div className="h-3 w-full bg-[#4CAF50]" />
                            <div className="p-5 flex-1 flex flex-col items-center text-center gap-4">
                                <div className="absolute top-3 right-3 text-[#4CAF50]">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>

                                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 border-4 border-[#1B5E20]/20 flex items-center justify-center text-[#1B5E20] shadow-inner mt-2">
                                    <CarFront className="w-10 h-10" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl font-['Playfair_Display'] text-[#0F3612]">Jordan M.</h3>
                                    <p className="text-[#1B5E20]/70 font-bold text-xs mt-1 uppercase tracking-widest">
                                        Race Car
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 w-full">
                                    <Badge className="w-full justify-center bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 border-0 py-1.5 font-black tracking-widest uppercase">
                                        READY
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Player 3 */}
                        <div className="relative flex flex-col bg-[#F5ECD5] rounded-xl overflow-hidden shadow-xl ring-4 ring-[#4CAF50] ring-offset-4 ring-offset-[#1B5E20] opacity-90 hover:opacity-100 transition-opacity">
                            <div className="h-3 w-full bg-[#4CAF50]" />
                            <div className="p-5 flex-1 flex flex-col items-center text-center gap-4">
                                <div className="absolute top-3 right-3 text-[#4CAF50]">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>

                                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 border-4 border-[#1B5E20]/20 flex items-center justify-center text-[#1B5E20] shadow-inner mt-2">
                                    <Dog className="w-10 h-10" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl font-['Playfair_Display'] text-[#0F3612]">Sam T.</h3>
                                    <p className="text-[#1B5E20]/70 font-bold text-xs mt-1 uppercase tracking-widest">
                                        Scottie Dog
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 w-full">
                                    <Badge className="w-full justify-center bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 border-0 py-1.5 font-black tracking-widest uppercase">
                                        READY
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Player 4 */}
                        <div className="relative flex flex-col bg-[#F5ECD5] rounded-xl overflow-hidden shadow-xl opacity-90 hover:opacity-100 transition-opacity">
                            <div className="h-3 w-full bg-[#F57C00]" />
                            <div className="p-5 flex-1 flex flex-col items-center text-center gap-4">

                                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 border-4 border-[#1B5E20]/20 flex items-center justify-center text-[#1B5E20] shadow-inner mt-2">
                                    <Ship className="w-10 h-10" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl font-['Playfair_Display'] text-[#0F3612]">Riley P.</h3>
                                    <p className="text-[#1B5E20]/70 font-bold text-xs mt-1 uppercase tracking-widest">
                                        Battleship
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 w-full">
                                    <Badge className="w-full justify-center bg-[#F57C00]/10 text-[#F57C00] hover:bg-[#F57C00]/20 border-0 py-1.5 font-black tracking-widest uppercase animate-pulse">
                                        WAITING...
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Empty Slot */}
                        <div className="relative flex flex-col bg-[#F5ECD5]/10 rounded-xl overflow-hidden border-2 border-dashed border-white/20 items-center justify-center text-white/40 p-6 min-h-[260px] shadow-inner">
                            <Users className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-bold text-sm uppercase tracking-widest text-center">Waiting for player...</p>
                            <p className="text-xs mt-2 opacity-60">Send code #BRDWLK</p>
                        </div>
                    </div>

                    {/* Chat / Activity Feed */}
                    <div className="shrink-0 bg-[#F5ECD5] rounded-xl shadow-2xl flex flex-col h-48 border-4 border-[#0F3612] overflow-hidden mt-auto">
                        <div className="bg-[#0F3612] text-[#F5ECD5] px-4 py-2 text-sm font-bold tracking-wider flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#A5D6A7]" />
                            LOBBY ACTIVITY
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-multiply custom-scrollbar">

                            <div className="flex items-start gap-3">
                                <div className="bg-[#1B5E20]/10 p-1.5 rounded-full mt-0.5">
                                    <BellRing className="w-3 h-3 text-[#1B5E20]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#0F3612]"><span className="font-bold">Alex K.</span> created the lobby.</p>
                                    <p className="text-xs text-[#1B5E20]/60 mt-0.5 font-medium">12:40 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-[#1B5E20]/10 p-1.5 rounded-full mt-0.5">
                                    <BellRing className="w-3 h-3 text-[#1B5E20]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#0F3612]"><span className="font-bold">Jordan M.</span> joined the game.</p>
                                    <p className="text-xs text-[#1B5E20]/60 mt-0.5 font-medium">12:42 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-[#E3000F]/10 p-1.5 rounded-full mt-0.5">
                                    <CarFront className="w-3 h-3 text-[#E3000F]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#0F3612]"><span className="font-bold">Jordan M.</span> chose the Race Car.</p>
                                    <p className="text-xs text-[#1B5E20]/60 mt-0.5 font-medium">12:42 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-[#4CAF50]/10 p-1.5 rounded-full mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#0F3612]"><span className="font-bold">Sam T.</span> is ready!</p>
                                    <p className="text-xs text-[#1B5E20]/60 mt-0.5 font-medium">12:45 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-[#1B5E20]/10 p-1.5 rounded-full mt-0.5">
                                    <BellRing className="w-3 h-3 text-[#1B5E20]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#0F3612]"><span className="font-bold">Riley P.</span> joined the game.</p>
                                    <p className="text-xs text-[#1B5E20]/60 mt-0.5 font-medium">Just now</p>
                                </div>
                            </div>

                        </div>
                        <div className="p-3 bg-white border-t border-[#0F3612]/10">
                            <div className="flex items-center gap-2 bg-[#F5ECD5]/50 rounded-lg p-1 border border-[#0F3612]/10 focus-within:border-[#1B5E20] focus-within:ring-1 focus-within:ring-[#1B5E20] transition-shadow">
                                <input
                                    type="text"
                                    placeholder="Type a message to the lobby..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-1.5 text-[#0F3612] placeholder:text-[#1B5E20]/40 font-medium"
                                />
                                <Button size="sm" variant="ghost" className="text-[#1B5E20] hover:bg-[#1B5E20]/10 font-bold">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Game Settings */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="bg-[#F5ECD5] rounded-xl shadow-2xl border-4 border-[#0F3612] overflow-hidden flex flex-col h-full">

                        <div className="bg-[#0F3612] text-[#F5ECD5] p-4 flex items-center justify-between shadow-md z-10">
                            <h2 className="font-bold tracking-wider text-lg flex items-center gap-2 font-['Playfair_Display']">
                                <Settings className="w-5 h-5 text-[#A5D6A7]" />
                                GAME RULES
                            </h2>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-blend-multiply custom-scrollbar">

                            {/* Money */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#1B5E20] uppercase tracking-widest border-b-2 border-[#1B5E20]/20 pb-1">Starting Capital</h3>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#0F3612]/10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#4CAF50]/20 p-2 rounded-md text-[#2E7D32]">
                                            <Coins className="w-4 h-4" />
                                        </div>
                                        <span className="text-base font-bold text-[#0F3612]">$1,500</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1B5E20] hover:bg-[#1B5E20]/10 font-bold tracking-wide">CHANGE</Button>
                                </div>
                            </div>

                            {/* House Rules */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#1B5E20] uppercase tracking-widest border-b-2 border-[#1B5E20]/20 pb-1">House Rules</h3>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0F3612]">Free Parking Jackpot</span>
                                            <span className="text-xs text-[#1B5E20]/70 font-medium">Taxes go to center pot</span>
                                        </div>
                                        <Switch
                                            checked={houseRules.freeParking}
                                            onCheckedChange={(c) => setHouseRules({ ...houseRules, freeParking: c })}
                                            className="data-[state=checked]:bg-[#4CAF50]"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0F3612]">Double Salary on GO</span>
                                            <span className="text-xs text-[#1B5E20]/70 font-medium">Land exactly on GO</span>
                                        </div>
                                        <Switch
                                            checked={houseRules.goSalary}
                                            onCheckedChange={(c) => setHouseRules({ ...houseRules, goSalary: c })}
                                            className="data-[state=checked]:bg-[#4CAF50]"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0F3612]">No Rent in Jail</span>
                                            <span className="text-xs text-[#1B5E20]/70 font-medium">Cannot collect rent while jailed</span>
                                        </div>
                                        <Switch
                                            checked={houseRules.noRentInJail}
                                            onCheckedChange={(c) => setHouseRules({ ...houseRules, noRentInJail: c })}
                                            className="data-[state=checked]:bg-[#4CAF50]"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0F3612]">Property Auctions</span>
                                            <span className="text-xs text-[#1B5E20]/70 font-medium">Unbought properties are auctioned</span>
                                        </div>
                                        <Switch
                                            checked={houseRules.auctions}
                                            onCheckedChange={(c) => setHouseRules({ ...houseRules, auctions: c })}
                                            className="data-[state=checked]:bg-[#4CAF50]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Game Speed */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-bold text-[#1B5E20] uppercase tracking-widest border-b-2 border-[#1B5E20]/20 pb-1">Game Pace</h3>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#0F3612]/10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#E3000F]/20 p-2 rounded-md text-[#E3000F]">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0F3612]">Turn Timer</span>
                                            <span className="text-xs text-[#1B5E20]/70 font-medium">60 seconds per turn</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1B5E20] hover:bg-[#1B5E20]/10 font-bold tracking-wide">EDIT</Button>
                                </div>
                            </div>

                        </div>

                        {/* Deed card decorative element at bottom */}
                        <div className="bg-white p-4 border-t-[12px] border-[#1B5E20] flex flex-col items-center justify-center m-5 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">Title Deed</span>
                            <span className="text-2xl font-black font-['Playfair_Display'] text-black uppercase tracking-wider">Boardwalk</span>
                            <div className="w-full h-[2px] bg-black/10 my-3"></div>
                            <span className="text-sm font-bold text-black/80">RENT $50.</span>
                        </div>

                    </div>
                </div>

            </main>

            {/* Add custom scrollbar styles globally for this component */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(27, 94, 32, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(27, 94, 32, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(27, 94, 32, 0.4);
        }
      `}} />
        </div>
    );
}
>>>>>>> Stashed changes
