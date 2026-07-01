import { cn } from "@/lib/utils";

interface SeatMapProps {
  capacity: number;
  taken: number[];
  selected: number[];
  onToggle: (seat: number) => void;
}

export function SeatMap({ capacity, taken, selected, onToggle }: SeatMapProps) {
  // Layout: 4-per-row (2 + aisle + 2). Last row may have fewer seats.
  const rows = Math.ceil(capacity / 4);
  const seats: (number | null)[][] = [];
  let n = 1;
  for (let r = 0; r < rows; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < 4; c++) {
      if (n <= capacity) row.push(n++);
      else row.push(null);
    }
    seats.push(row);
  }

  const takenSet = new Set(taken);
  const selectedSet = new Set(selected);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      {/* driver cabin */}
      <div className="mb-4 flex items-center justify-between border-b border-dashed border-border pb-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">Driver</span>
        <div className="grid h-8 w-10 place-items-center rounded-md bg-muted text-lg">🚌</div>
      </div>

      <div className="mx-auto grid max-w-xs gap-2">
        {seats.map((row, ri) => (
          <div key={ri} className="grid grid-cols-[1fr_1fr_0.5fr_1fr_1fr] gap-1.5">
            {row.slice(0, 2).map((s, i) => (
              <Seat key={`l-${i}`} seat={s} taken={s !== null && takenSet.has(s)} selected={s !== null && selectedSet.has(s)} onClick={onToggle} />
            ))}
            <div />
            {row.slice(2, 4).map((s, i) => (
              <Seat key={`r-${i}`} seat={s} taken={s !== null && takenSet.has(s)} selected={s !== null && selectedSet.has(s)} onClick={onToggle} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs">
        <Legend className="bg-background border-border" label="Available" />
        <Legend className="bg-primary text-primary-foreground border-primary" label="Selected" />
        <Legend className="bg-muted text-muted-foreground border-border" label="Taken" />
      </div>
    </div>
  );
}

function Seat({ seat, taken, selected, onClick }: { seat: number | null; taken: boolean; selected: boolean; onClick: (s: number) => void }) {
  if (seat === null) return <div />;
  return (
    <button
      type="button"
      disabled={taken}
      onClick={() => onClick(seat)}
      className={cn(
        "aspect-square rounded-md border text-xs font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-primary text-primary-foreground border-primary shadow-elegant",
        taken && "bg-muted text-muted-foreground border-border cursor-not-allowed line-through",
        !selected && !taken && "bg-background border-border hover:border-primary/60 hover:bg-primary/5",
      )}
    >
      {seat}
    </button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-4 w-4 rounded border", className)} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
