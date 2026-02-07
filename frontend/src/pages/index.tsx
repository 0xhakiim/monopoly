import { useState, useEffect, useRef, useMemo } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { DiceRoller } from '@/components/DiceRoller';
import { PlayerPanel } from '@/components/PlayerPanel';
import { Button } from '@/components/ui/button';
import type { Mutable_property, Player, SquareTile, auctionState } from '@/types/monopoly';
import { toast } from 'sonner';
import JailDecisionModal from '@/components/JailDecisionModel';

import { useGameSocket } from "@/hooks/use-gameSocket";
import AuctionModel from '@/components/Auction';
import BuildHouseModal from '@/components/BuildHouseModal';
import DevPanel from '@/components/DevPanel';
import { boardSpaces } from '@/data/boardSpaces';



type IncomingPlayerTuple = [number, Player];
type IncomingData = IncomingPlayerTuple[];

// Renamed from PropertyForSale to SquareTile to accurately reflect the full Pydantic model





export function parsePlayerList(incomingdata: IncomingData): Player[] {
    // Use .map() to iterate over the outer array.
    // For each inner array [tokenId, playerObject], we return the playerObject (index 1).
    if (incomingdata.length == 0) {
        return [];
    }
    return incomingdata.map(([, playerObject]) => playerObject);
}
export function transformPlayers(playersDict: Record<string, Player> | undefined): Player[] {
    if (!playersDict) return [];
    return Object.entries(playersDict).map(([globalId, playerObj]) => ({
        ...playerObj,
        globalUserId: globalId, // The ID from the token/map key
    })).sort((a, b) => a.id - b.id);
}
export function playersDictToArray(dict: Record<string, Player> | undefined): Player[] {
    if (!dict) return [];
    return Object.entries(dict).map(([userId, playerObj]) => ({
        ...playerObj,
        globalUserId: Number(userId), // Keep track of the map key
    })).sort((a, b) => a.id - b.id); // Sort by local turn index
}
const BuyDecisionModal = ({ property, onBuy, onPass, isAffordable }: { property: SquareTile, onBuy: () => void, onPass: () => void, isAffordable: boolean }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-black">
                <h3 className="text-xl font-bold mb-4">🏠 Buy Property?</h3>
                <p className="mb-4">
                    You landed on **{property.name}**.
                    The price is **${property.details?.price}**.
                </p>
                <div className="flex gap-4">
                    <Button
                        onClick={onBuy}
                        disabled={!isAffordable}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isAffordable ? `Buy (${property.details?.price})` : "Can't Afford"}
                    </Button>
                    <Button
                        onClick={onPass}
                        variant="outline"
                        className="flex-1 text-white"
                    >
                        Pass (Start Auction)
                    </Button>
                </div>
                {!isAffordable && (
                    <p className="text-sm text-red-500 mt-2">You don't have enough money to buy this outright.</p>
                )}
            </div>
        </div>
    );
};
const Index = () => {
    // 1. Refactor: Renamed for clarity - this is *our* player's ID
    const [localPlayerId] = useState<number>(() => Number(new URLSearchParams(window.location.search).get("playerId") ?? 0));
    const [localGameId] = useState<string | undefined>(() => new URLSearchParams(window.location.search).get("gameId") ?? undefined);
    const [messages, setMessages] = useState<{ sender: string, text: string, color: string }[]>([]);
    // 2. State variables managed by the server state
    const { connected, sendAction, lastRawMessage, gameState } = useGameSocket(localGameId, localPlayerId, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
    });

    // We will derive players and currentTurnPlayerId from gameState
    const playersDict: Record<string, Player> = gameState?.players || {};
    const playersArray: Player[] = gameState?.players || [];
    const players = playersArray
    const localPlayer = playersArray.find(p => p.id === localPlayerId) || null;

    // Architectural Fix: The player whose turn it is must come from the server state
    const currentTurnPlayerId: number | undefined = gameState?.turn;

    const [lastDice, setLastDice] = useState<[number, number] | [0, 0]>([0, 0]);

    const isDecideToBuyPhase = (((gameState?.phase ?? "") == "DECIDE_TO_BUY") && (currentTurnPlayerId === localPlayerId));
    console.log("local player id:", localPlayerId);
    console.log("current turn player id:", currentTurnPlayerId);
    const message = lastRawMessage?.message || "";
    //const [cachedLocalPlayer, setCachedLocalPlayer] = useState<Player | null>(localPlayer ?? null);

    const [cachedLocalPlayer, setCachedLocalPlayer] = useState<Player | null>(null);
    useEffect(() => {
        if (localPlayer) {
            setCachedLocalPlayer(localPlayer);
        }
    }, [localPlayer]);
    const propertyForSale: SquareTile | undefined = gameState?.propertyForSale;

    const isAuctionPhase = gameState?.phase === "AUCTION_PROPERTY" || gameState?.phase === "AUCTION";

    const auction: auctionState | undefined = gameState?.auction;
    const highestBidder = auction?.highest_bidder
    const handleBid = async (amount: number) => {

        await sendAction({
            action: "place_bid",
            payload: { amount }
        });
        console.log("Placed bid of amount:", amount);
    };

    const handleFold = async () => {

        await sendAction({
            action: "fold_auction"
        });
        console.log("Folded from auction");
    };

    // Calculate purchasePrice by looking into the nested 'details' object (This logic is correct)
    const purchasePrice = propertyForSale?.details?.price;
    const isAffordable = purchasePrice !== undefined && localPlayer
        ? localPlayer.money >= purchasePrice
        : false;

    const [chatInput, setChatInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);


    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMessage = {
            sender: gameState?.players[localPlayerId]?.name || "Player",
            text: chatInput,
            color: gameState?.players[localPlayerId]?.color || "#000"
        };

        // Send to server
        await sendAction({ action: 'CHAT', payload: newMessage });
        console.log("Sent chat message:", newMessage);
        setChatInput("");
    };
    // 3. Update useEffect logic to use gameState as the main source of truth
    useEffect(() => {

        if (gameState) {
            // Update last dice roll if present in the game state or a specific message type
            if (gameState?.dice) { // Assuming gameState has a dice property
                setLastDice(gameState?.dice);
            }

            // If the server sends specific messages, handle them here
        }

        // Handle raw messages like server notifications/dice results
        if (lastRawMessage) {
            if (typeof lastRawMessage === "object") {
                if (lastRawMessage.type === "game_update" && gameState?.dice !== undefined) {
                    setLastDice(gameState?.dice);
                    console.debug("Dice result from server:", lastRawMessage.dice);
                }
                if (lastRawMessage.type === "reset_game") {
                    setLastDice([0, 0]);
                    console.debug("Game reset received from server.");
                }
                if (gameState?.phase == "DECIDE_TO_BUY") {
                    console.log(isDecideToBuyPhase, isLocalPlayersTurn, propertyForSale)
                }
                // No need to set players here if useGameSocket updates gameState on "game_state" or "game_start"
            } else if (typeof lastRawMessage === "string") {
                console.debug("Server text:", lastRawMessage);
            }
        }

    }, [connected, gameState, lastRawMessage]); // Depend on gameState and lastRawMessage

    // Helper to find the current player object
    const currentTurnPlayer = gameState?.turn

    // Check if it's the local client's turn to enable/disable controls
    const isLocalPlayersTurn = currentTurnPlayerId === localPlayerId;

    const handleRoll = async () => {
        // Only allow roll if it's the local player's turn
        if (isLocalPlayersTurn) {
            await sendAction({ action: "roll_dice" });
        } else {
            toast.error("It's not your turn!");
        }
    };
    const handleBuyProperty = async () => {
        if (!isLocalPlayersTurn || !propertyForSale) return;

        await sendAction({
            action: "buy_property",
            payload: { square_id: propertyForSale.id }
        });
    };
    const [showdevpanel, setShowDevPanel] = useState(false);
    const handlePassOnBuy = async () => {
        if (!isLocalPlayersTurn || !propertyForSale) return;

        // This action tells the server to initiate an auction or simply pass the turn
        await sendAction({
            action: "pass_on_buy",
            payload: { square_id: propertyForSale.id }
        });
        toast.info("Property passed to auction.");
    };
    const handleJailPay = async () => {
        await sendAction({ action: "jail_action", payload: { action: "PAY" } })
    }

    const handleJailRoll = async () => {
        await sendAction({ action: "jail_action", payload: { action: "ROLL" } })
    }

    const handleJailCard = async () => {
        await sendAction({ action: "jail_action", payload: { action: "CARD" } })
    }
    const handleBuildHouse = async (squareId: number) => {
        await sendAction({
            action: "build_house",
            payload: { square_id: squareId }
        });
        setShowBuildModal(false);
        console.log("Building house on square ID:", squareId);
    };
    const endTurn = async () => {
        // Only allow ending turn if it's the local player's turn AND they have rolled
        if (isLocalPlayersTurn && lastDice[0] > 0) {
            await sendAction({ action: "end_turn" });
            setLastDice([0, 0]); // Optimistically reset dice
        } else if (!isLocalPlayersTurn) {
            toast.error("It's not your turn!");
        } else {
            toast.error("You must roll the dice before ending your turn.");
        }
    };
    const handleResetGame = async () => {
        await sendAction({ action: "reset_game" });
    };
    const [showBuildModal, setShowBuildModal] = useState(false);
    const buildableProperties = Object.fromEntries(
        Object.entries(gameState?.mutable_properties ?? {})
            .filter(([_, sq]) =>
                sq.owner_id === localPlayerId &&
                sq.houses < 4 &&
                !sq.mortgaged
            )
            .map(([id, sq]) => [Number(id), sq]) as [number, Mutable_property][]
    );

    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

    // Find the full property object from the ID
    const selectedProperty: Mutable_property | null = useMemo(() => {
        if (!gameState?.mutable_properties) return null;

        // If it's an array:
        if (Array.isArray(gameState.mutable_properties)) {
            return gameState.mutable_properties.find(s => s.id === selectedPropertyId);
        }

        // If it's an object/dictionary:
        return Object.values(gameState.mutable_properties).find(s => s.id === selectedPropertyId);
    }, [gameState?.mutable_properties, selectedPropertyId]);

    // Check if the local player owns this property
    const isOwner = gameState?.players[localPlayerId]?.properties.includes(selectedPropertyId);
    window.document.title = `Monopoly Game ${localGameId || ""} - Player ${localPlayer?.name || ""}`;
    window.properties = buildableProperties; // For debugging
    window.auction = auction; // For debugging
    window.gameState = gameState; // For debugging
    window.players = players; // For debugging
    window.isAuctionPhase = isAuctionPhase // For debugging
    window.localPlayer = localPlayer; // For debugging
    window.currentPlayer = currentTurnPlayer; // For debugging
    window.propertyForSale = propertyForSale; // For debugging
    window.propertyForSale = propertyForSale; // For debugging
    window.isDecideToBuyPhase = isDecideToBuyPhase; // For debugging
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mb-4 text-sm text-muted-foreground">{message}</div>
            <Button
                onClick={handleResetGame}
                variant="destructive"
                className="mb-4"
            >   reset game</Button>
            <Button
                onClick={() => setShowBuildModal(true)}
                disabled={!isLocalPlayersTurn || buildableProperties.length === 0}
                className="w-full"
            >
                Build House
            </Button>
            <Button
                onClick={() => setShowDevPanel(true)}
                className="w-full"
            >
                Open Dev Panel
            </Button>
            <div className="max-w-[1400px] mx-auto">
                <div className="flex gap-8 items-start justify-center">

                    {/* Buy Decision Modal */}
                    {
                        isDecideToBuyPhase && propertyForSale && (

                            <BuyDecisionModal
                                property={propertyForSale}
                                onBuy={handleBuyProperty}
                                onPass={handlePassOnBuy}
                                isAffordable={isAffordable}
                            />
                        )}
                    {showdevpanel && (
                        <DevPanel
                            gameId={localGameId ?? ""}
                            players={gameState.players}
                            currentPhase={gameState.phase}
                        />
                    )}
                    {showBuildModal && (
                        <BuildHouseModal
                            properties={
                                Object.entries(buildableProperties).map(
                                    ([id, sq]) => ({ id: Number(id), ...sq })
                                )
                            }
                            onBuild={handleBuildHouse}
                            onClose={() => setShowBuildModal(false)}
                        />
                    )}

                    {
                        gameState?.phase === "JAIL_DECISION" &&
                        isLocalPlayersTurn &&
                        localPlayer?.in_jail && (
                            <JailDecisionModal
                                canUseCard={(localPlayer.get_out_of_jail_free ?? 0) > 0}
                                onPay={handleJailPay}
                                onRoll={handleJailRoll}
                                onUseCard={handleJailCard}
                            />
                        )
                    }
                    {/* Left panel - Players */}
                    {playersArray.length > 0 && currentTurnPlayerId !== undefined && (
                        <div>
                            {/* Architectural Fix: Pass the server-determined currentTurnPlayerId */}
                            <PlayerPanel players={playersArray} currentPlayerId={currentTurnPlayerId} />
                        </div>)
                    }
                    {/* Center - Game Board */}
                    <div className="flex flex-col items-center gap-6">
                        <GameBoard players={playersArray} onSelectSpace={(id) => setSelectedPropertyId(id)} />
                    </div>
                    <div className="w-80 flex flex-col gap-4">

                        {/* Property Management Panel */}
                        {selectedProperty as Mutable_property[] && (
                            <div className="bg-card border-2 border-border rounded-lg p-4 shadow-lg">
                                <h3 className="text-xl font-bold border-b pb-2 mb-2">{selectedProperty.name}</h3>

                                {isOwner ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-green-600 font-semibold">You own this property</p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="text-xs"
                                                onClick={() => sendAction({ action: 'MORTGAGE', payload: { propertyId: selectedPropertyId } })}
                                            >
                                                Mortgage
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="text-xs"
                                                disabled={!(selectedProperty.details?.houses)}
                                                onClick={() => sendAction({ action: 'SELL_HOUSE', payload: { propertyId: selectedPropertyId } })}
                                            >
                                                Sell House
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-muted-foreground">
                                        {selectedProperty?.details?.price ? `Price: $${selectedProperty.details.price}` : "Cannot be purchased"}
                                    </p>
                                )}
                                <Button
                                    variant="ghost"
                                    className="w-full mt-4 text-xs"
                                    onClick={() => setSelectedPropertyId(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Auction Modal */}
                    {isAuctionPhase && auction && localPlayer && (
                        <AuctionModel
                            property={auction.auctionProperty}
                            highestBid={auction.highest_bid || 0}
                            highestBidderName={highestBidder?.name || "None"}
                            isMyTurnToBid={auction?.turn_index === localPlayerId || false}
                            onBid={handleBid}
                            onFold={handleFold}
                            playerMoney={localPlayer.money}
                        />
                    )}
                    {/* Right panel - Controls */}
                    <div className="w-64 space-y-4">

                        <div className="bg-card border-2 border-border rounded-lg p-6">
                            <h3 className="text-xl font-bold mb-4 text-center">Game Controls</h3>

                            <DiceRoller
                                onRoll={handleRoll}
                                // Disable if it's not our turn OR we've already rolled (dice > 0)
                                disabled={!isLocalPlayersTurn || gameState?.phase !== "WAIT_FOR_ROLL"}
                                currentRoll={lastDice}
                            />

                            <div className="mt-6 space-y-2">
                                <Button
                                    onClick={endTurn}
                                    // Disable if it's not our turn OR we haven't rolled yet
                                    disabled={!isLocalPlayersTurn || gameState?.phase != "WAIT_FOR_NEXT_TURN"}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    End Turn
                                </Button>
                            </div>
                        </div>
                        {/* CHAT BOX */}
                        <div className="flex flex-col h-64 bg-card border-2 border-border rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-muted p-2 border-b font-bold text-xs uppercase tracking-wider">
                                Game Chat
                            </div>

                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-2 space-y-2 text-sm"
                            >
                                {messages.length === 0 && (
                                    <p className="text-muted-foreground italic text-center text-xs mt-4">
                                        No messages yet. Say hello!
                                    </p>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className="break-words">
                                        <span className="font-bold" style={{ color: msg.color }}>
                                            {msg.sender}:
                                        </span>{" "}
                                        <span className="text-foreground">{msg.text}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={sendMessage} className="p-2 border-t flex gap-2">
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-background text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <Button type="submit" size="sm" className="h-8 px-2 text-xs">
                                    Send
                                </Button>
                            </form>
                        </div>
                        {currentTurnPlayer &&
                            <div className="bg-card border-2 border-border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Current Turn</h4>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        // Use the current player's actual color for better UX
                                        style={{ backgroundColor: currentTurnPlayer.color }}
                                    />
                                    {/* Architectural Fix: Display the name of the player whose turn it is */}
                                    <span className="font-medium">{currentTurnPlayer.name}</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;