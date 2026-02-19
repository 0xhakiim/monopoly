// GameOverModal.tsx
// Drop this file alongside your other components and import it in Index.tsx

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Player } from "@/types/monopoly";

interface GameOverModalProps {
    winner: Player | null;
    players: Player[];
    onRestart: () => void;
}

export const GameOverModal = ({ winner, players, onRestart }: GameOverModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simple confetti particle effect on the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

        const particles = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 6,
            h: Math.random() * 6 + 3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speed: Math.random() * 3 + 1.5,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 4,
            drift: (Math.random() - 0.5) * 1.5,
        }));

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.angle * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                p.y += p.speed;
                p.x += p.drift;
                p.angle += p.spin;

                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Sort players by money descending for leaderboard
    const leaderboard = [...players].sort((a, b) => (b.money ?? 0) - (a.money ?? 0));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Confetti canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: 1 }} />

            {/* Card */}
            <div
                className="relative rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
                style={{
                    zIndex: 2,
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    border: "2px solid rgba(255,215,0,0.4)",
                    boxShadow: "0 0 60px rgba(255,215,0,0.15), 0 25px 50px rgba(0,0,0,0.6)",
                }}
            >
                {/* Trophy */}
                <div
                    className="text-7xl mb-2"
                    style={{ filter: "drop-shadow(0 0 20px rgba(255,215,0,0.8))", animation: "pulse 2s infinite" }}
                >
                    🏆
                </div>

                <h1
                    className="text-4xl font-extrabold mb-1 tracking-tight"
                    style={{
                        background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    GAME OVER
                </h1>

                {winner ? (
                    <>
                        <div className="mt-4 mb-6">
                            <div
                                className="inline-block w-5 h-5 rounded-full mr-2 align-middle border-2 border-white/30"
                                style={{ backgroundColor: winner.color }}
                            />
                            <span className="text-white text-xl font-bold">{winner.name}</span>
                            <p className="text-yellow-400 font-semibold mt-1">
                                wins with ${winner.money?.toLocaleString()}!
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-white/70 mt-2 mb-6">The game has ended.</p>
                )}

                {/* Leaderboard */}
                <div
                    className="rounded-xl overflow-hidden mb-6"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <div className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 font-semibold border-b border-white/10">
                        Final Standings
                    </div>
                    {leaderboard.map((p, i) => (
                        <div
                            key={p.id}
                            className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-0"
                            style={{
                                background: i === 0 ? "rgba(255,215,0,0.08)" : "transparent",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-white/40 text-sm w-5">{i + 1}.</span>
                                <div
                                    className="w-3 h-3 rounded-full border border-white/20"
                                    style={{ backgroundColor: p.color }}
                                />
                                <span className={`text-sm font-medium ${i === 0 ? "text-yellow-300" : "text-white/80"}`}>
                                    {p.name}
                                </span>
                                {i === 0 && <span className="text-xs">👑</span>}
                            </div>
                            <span className={`text-sm font-mono ${i === 0 ? "text-yellow-300 font-bold" : "text-white/60"}`}>
                                ${p.money?.toLocaleString() ?? 0}
                            </span>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={onRestart}
                    className="w-full py-3 font-bold text-base rounded-xl transition-all duration-200"
                    style={{
                        background: "linear-gradient(90deg, #FFD700, #FFA500)",
                        color: "#1a1a2e",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(255,165,0,0.4)",
                    }}
                >
                    🎲 Play Again
                </Button>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
        </div>
    );
};