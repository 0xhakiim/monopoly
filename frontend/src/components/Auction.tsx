import { useState } from "react";
import type { SquareTile } from "@/types/monopoly";
import { Button } from "./ui/button";
const AuctionModel = ({
    property,
    highestBid,
    highestBidderName,
    isMyTurnToBid,
    onBid,
    onFold,
    playerMoney
}: {
    property: SquareTile,
    highestBid: number,
    highestBidderName: string,
    isMyTurnToBid: boolean,
    onBid: (amount: number) => void,
    onFold: () => void,
    playerMoney: number
}) => {
    const [bidAmount, setBidAmount] = useState(highestBid + 10);
    console.log("Rendering AuctionModal", { property, highestBid, highestBidderName, isMyTurnToBid, playerMoney });
    return (
        <div className="auction fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-black">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-red-600">🔨 Property Auction</h2>
                    <p className="text-gray-600 font-medium">{property.name}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 uppercase">Current Bid</p>
                        <p className="text-3xl font-black">${highestBid}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase">High Bidder</p>
                        <p className="font-bold">{highestBidderName || "No bids yet"}</p>
                    </div>
                </div>

                {isMyTurnToBid ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Your Bid Amount (Min: ${highestBid + 1})</label>
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(Math.max(highestBid + 1, parseInt(e.target.value) || 0))}
                                className="border-2 border-primary p-2 rounded text-lg font-bold"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => onBid(bidAmount)}
                                disabled={bidAmount > playerMoney}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Place Bid
                            </Button>
                            <Button
                                onClick={onFold}
                                variant="destructive"
                                className="flex-1"
                            >
                                Fold
                            </Button>
                        </div>
                        {bidAmount > playerMoney && (
                            <p className="text-xs text-red-500 text-center">You cannot bid more than you have (${playerMoney})</p>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-4 bg-blue-50 text-blue-700 rounded-md animate-pulse">
                        Waiting for other players to bid...
                    </div>
                )}
            </div>
        </div>
    );
};
export default AuctionModel;