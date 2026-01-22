"use client"

import { Category, categoryColors } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  selected: Category | "All"
  onChange: (category: Category | "All") => void
}

const categories: (Category | "All")[] = [
  "All",
  "Social",
  "Bank",
  "Learning",
  "Business",
  "Government",
  "Technology",
]

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant="ghost"
          size="sm"
          onClick={() => onChange(category)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
            selected === category
              ? category === "All"
                ? "border-primary/50 bg-primary/10 text-primary"
                : cn(categoryColors[category as Category], "border")
              : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
