import React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Users, Settings, MessageSquare, LogOut,
    CarFront, Dog, Ship, Dice1, Dice5, Coins, Trophy,
    CheckCircle2, Clock, Hash, TrainTrack, Building2,
    BellRing
} from "lucide-react";
import type { LobbyPlayer } from "@/types/monopoly";
export default function LobbyPlayerCard({ player }: { player: LobbyPlayer }) {
    return (
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
                        player.username
                    </p>
                </div>

                <div className="mt-auto pt-4 w-full">
                    <Badge className="w-full justify-center bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 border-0 py-1.5 font-black tracking-widest uppercase">
                        {player.ready ? <p>Ready</p> : <p>Waiting to be Ready</p>}
                    </Badge>
                </div>
            </div>
        </div>
    );
} []