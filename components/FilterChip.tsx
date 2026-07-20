import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterChipProps {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  dropdown?: boolean
}

export function FilterChip({
  icon: Icon,
  label,
  active,
  onClick,
  dropdown,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-between w-full rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors text-left",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      {dropdown && <ChevronDown className="size-3 opacity-70" />}
    </button>
  )
}