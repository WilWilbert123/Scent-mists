import React from "react";
import { Flower2, Wind, Droplets } from "lucide-react";

interface FragranceNotesDisplayProps {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
}

export function FragranceNotesDisplay({
  topNotes,
  heartNotes,
  baseNotes,
}: FragranceNotesDisplayProps) {
  return (
    <div className="space-y-6 border border-border bg-surface/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-4">
        <h2 className="font-serif text-2xl text-foreground">
          Olfactory Architecture
        </h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Three-Tier Scent Evolution
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Top Notes */}
        <div className="space-y-3 border border-border/70 bg-surface-elevated p-5">
          <div className="flex items-center gap-2 text-accent">
            <Wind className="h-4 w-4" aria-hidden="true" />
            <h3 className="eyebrow-label text-foreground">Top Notes</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            The immediate impression—luminous, volatile, and airy.
          </p>
          <ul className="space-y-1.5 pt-1 text-sm text-foreground">
            {topNotes.map((note) => (
              <li key={note} className="border-l-2 border-accent/50 pl-3 py-0.5">
                {note.replace(" (Sample)", "")}
              </li>
            ))}
          </ul>
        </div>

        {/* Heart Notes */}
        <div className="space-y-3 border border-border/70 bg-surface-elevated p-5">
          <div className="flex items-center gap-2 text-accent">
            <Flower2 className="h-4 w-4" aria-hidden="true" />
            <h3 className="eyebrow-label text-foreground">Heart Notes</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            The botanical core—unfolding across several hours on the skin.
          </p>
          <ul className="space-y-1.5 pt-1 text-sm text-foreground">
            {heartNotes.map((note) => (
              <li key={note} className="border-l-2 border-accent/50 pl-3 py-0.5">
                {note.replace(" (Sample)", "")}
              </li>
            ))}
          </ul>
        </div>

        {/* Base Notes */}
        <div className="space-y-3 border border-border/70 bg-surface-elevated p-5">
          <div className="flex items-center gap-2 text-accent">
            <Droplets className="h-4 w-4" aria-hidden="true" />
            <h3 className="eyebrow-label text-foreground">Base Notes</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            The lasting foundation—warm woods, resins, and soft musk.
          </p>
          <ul className="space-y-1.5 pt-1 text-sm text-foreground">
            {baseNotes.map((note) => (
              <li key={note} className="border-l-2 border-accent/50 pl-3 py-0.5">
                {note.replace(" (Sample)", "")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
