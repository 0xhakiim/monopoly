import React from "react"
import { Button } from "./ui/button"
const JailDecisionModal = ({
    canUseCard,
    onPay,
    onRoll,
    onUseCard,
}: {
    canUseCard: boolean
    onPay: () => void
    onRoll: () => void
    onUseCard: () => void
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-black">
                <h3 className="text-xl font-bold mb-4">🚔 You are in Jail</h3>

                <div className="space-y-3">
                    <Button onClick={onPay} className="w-full">
                        Pay $50
                    </Button>

                    <Button onClick={onRoll} variant="secondary" className="w-full">
                        Roll for doubles
                    </Button>

                    <Button
                        onClick={onUseCard}
                        disabled={!canUseCard}
                        variant="outline"
                        className="w-full"
                    >
                        Use Get Out of Jail Free
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default JailDecisionModal