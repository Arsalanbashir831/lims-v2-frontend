"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWelders } from "@/hooks/use-welders"
import { Welder } from "@/lib/schemas/welder"

interface WelderSelectorProps {
  value?: string // welder ID
  onValueChange: (welderId: string | undefined, welder: Welder | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function WelderSelector({
  value,
  onValueChange,
  placeholder = "Select welder...",
  disabled = false,
  className
}: WelderSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Use the welders hook with debounced search
  const { data: weldersData, isLoading, error } = useWelders(1, debouncedSearchQuery, 50)

  // Extract welders from the response
  const welders = weldersData?.results || []

  // Find selected welder
  const selectedWelder = useMemo(() => {
    return welders.find(welder => welder.id === value)
  }, [welders, value])

  const handleSelect = useCallback((welderId: string) => {
    const welder = welders.find(w => w.id === welderId)
    if (welder) {
      onValueChange(welderId, welder)
      setOpen(false)
      setSearchQuery("")
    }
  }, [welders, onValueChange])

  const handleClear = useCallback(() => {
    onValueChange(undefined, undefined)
    setSearchQuery("")
  }, [onValueChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="h-fit p-0">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-fit", className)}
          disabled={disabled}
        >
          {selectedWelder ? (
            <div className="flex flex-col items-start">
              <p className="font-medium">{selectedWelder.operator_name}</p>
              {/* <p className="text-sm text-muted-foreground">{selectedWelder.operator_id}</p> */}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b">
           <CommandInput
              placeholder="Search welders..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading welders...
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-red-500">
                Failed to load welders
              </div>
            ) : welders.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? "No welders found." : "No welders available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {welders.map((welder) => (
                  <CommandItem
                    key={welder.id}
                    value={welder.id}
                    onSelect={() => handleSelect(welder.id!)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{welder.operator_name}</p>
                        <p className="text-sm text-muted-foreground">{welder.operator_id}</p>
                        <p className="text-xs text-muted-foreground">IQAMA: {welder.iqama}</p>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === welder.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {selectedWelder && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full text-xs"
              >
                Clear selection
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
