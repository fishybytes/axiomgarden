import { advanceDay, resetDays } from "@/lib/dev-actions";

export default function DevTimeControls({ today, offset }: { today: string; offset: number }) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 rounded-lg border border-yellow-800/60 bg-yellow-950/90 px-3 py-2 text-xs text-yellow-400 backdrop-blur">
      <span className="font-mono">{today}{offset !== 0 && ` (+${offset}d)`}</span>
      <form action={advanceDay}>
        <button type="submit" className="hover:text-yellow-200">+1 day</button>
      </form>
      <form action={resetDays}>
        <button type="submit" className="hover:text-yellow-200">reset</button>
      </form>
    </div>
  );
}
