// w pliku src/components/ui/toggle.tsx

import { cva } from "class-variance-authority";

const toggleVariants = cva(
  // Style bazowe, wspólne dla wszystkich
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        // Nasz nowy, dedykowany wariant, który odtworzy wygląd z makiety
        pill: [
          "text-slate-800", // Kolor tekstu dla nieaktywnego przycisku
          "hover:bg-slate-200/50", // Delikatny efekt hover dla nieaktywnego
          
          // Style dla AKTYWNEGO przycisku (`data-[state=on]`)
          "data-[state=on]:bg-primary", // Używa koloru primary (Twojego zielonego)
          "data-[state=on]:text-white", // Biały tekst dla aktywnego
          "data-[state=on]:shadow-md" // Subtelny cień dla aktywnego, aby dodać głębi
        ],
        // Domyślne warianty z shadcn/ui (możesz je zostawić lub usunąć, jeśli nie używasz)
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10", // Domyślny rozmiar, dopasowany do makiety
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export { toggleVariants };