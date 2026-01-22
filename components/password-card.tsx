"use client";

import { PasswordEntry, categoryColors } from "@/lib/types";
import { ServiceIcon } from "./service-icon";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PasswordCardProps {
  entry: PasswordEntry;
  onClick: () => void;
}

export function PasswordCard({ entry, onClick }: PasswordCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
          <ServiceIcon
            serviceName={entry.service_name}
            className="h-5 w-5 text-foreground/80"
          />
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-xs font-medium",
            categoryColors[entry.category]
          )}
        >
          {entry.category}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">
          {entry.service_name}
        </h3>
        <p className="truncate text-sm text-muted-foreground">{entry.username}</p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Updated {format(new Date(entry.updated_at), "MMM d, yyyy")}
        </span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Click to view
        </span>
      </div>
    </button>
  );
}
