"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useWelderCards } from "@/hooks/use-welder-cards"
import { WelderCard } from "@/lib/schemas/welder"

interface WelderCardSelectorProps {
  value?: string
  onValueChange: (value: string, welderCard?: WelderCard) => void
  placeholder?: string
  className?: string
}

export function WelderCardSelector({
  value,
  onValueChange,
  placeholder = "Select welder card...",
  className
}: WelderCardSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: welderCardsData, isLoading } = useWelderCards(1, debouncedQuery, 50)
  const welderCards = welderCardsData?.results || []

  const selectedWelderCard = welderCards.find(card => card.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedWelderCard ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">
                {selectedWelderCard.welder_info?.operator_name || "Unknown Welder"}
              </span>
              <span className="text-xs text-muted-foreground">
                Card: {selectedWelderCard.card_no} | Company: {selectedWelderCard.company}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search welder cards..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading welder cards...
              </div>
            ) : welderCards.length === 0 ? (
              <CommandEmpty>No welder cards found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {welderCards.map((card) => (
                  <CommandItem
                    key={card.id}
                    value={card.id}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue, card)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === card.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {card.welder_info?.operator_name || "Unknown Welder"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Card: {card.card_no} | Company: {card.company} | ID: {card.welder_info?.operator_id}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
