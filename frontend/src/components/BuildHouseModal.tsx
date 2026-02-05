import type { Mutable_property } from "../types/monopoly";
import { Button } from "./ui/button";
import { Home, Hotel, Plus } from "lucide-react"; // Optional: Lucide icons for flair

const BuildHouseModal = ({
  properties,
  onBuild,
  onClose,
}: {
  properties: Mutable_property[];
  onBuild: (squareId: number) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-50 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 border-slate-300 text-slate-900">
        {/* Header */}
        <div className="bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter italic">
            🏗️ Real Estate Office
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase">Improve Property</span>
        </div>

        {/* Property List */}
        <div className="max-height-[60vh] overflow-y-auto p-4 space-y-3">
          {properties.length === 0 ? (
            <p className="text-center py-8 text-slate-500 italic">No improvable properties owned.</p>
          ) : (
            properties.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm hover:border-blue-400 transition-colors"
              >
                {/* Property "Card" Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-12 rounded-full"
                    style={{ backgroundColor: p.details?.color || '#ccc' }}
                  />
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{p.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {/* Show current houses */}
                      {[...Array(p.houses || 0)].map((_, i) => (
                        <Home key={i} size={12} className="text-green-600 fill-green-600" />
                      ))}
                      {p.houses === 0 && (
                        <span className="text-[10px] text-slate-400 font-medium italic">Empty Lot</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Build Action */}
                <Button
                  onClick={() => onBuild(p.id ?? -1)}
                  disabled={p.houses === 5} // Cap at 5 (Hotel)
                  className="bg-green-600 hover:bg-green-700 text-white flex gap-2 h-10 px-4"
                >
                  <Plus size={16} />
                  <span className="font-bold">${p?.details?.house_cost}</span>
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-600 hover:text-slate-900 font-bold"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuildHouseModal;