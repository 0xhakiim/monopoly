import { Button } from "@/components/ui/button"
import type { SquareTile } from "@/types/monopoly"
const BuildHousePanel = ({
  properties,
  onBuild,
}: {
  properties: SquareTile[]
  onBuild: (squareId: number) => void
}) => {
  if (properties.length === 0) return null

  return (
    <div className="bg-card border-2 border-border rounded-lg p-4">
      <h4 className="font-semibold mb-2">Build Houses</h4>

      <div className="space-y-2">
        {properties.map(p => (
          <Button
            key={p.id}
            onClick={() => onBuild(p.id)}
            className="w-full"
            variant="secondary"
          >
            Build on {p.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
