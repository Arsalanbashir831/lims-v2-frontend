"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { welderService } from "@/services/welders.service"
import { Welder } from "@/components/welders/welder-form"

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
  const [welders, setWelders] = useState<Welder[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load welders on component mount
  useEffect(() => {
    const loadWelders = async () => {
      try {
        setLoading(true)
        const data = await welderService.getAll()
        setWelders(data)
      } catch (error) {
        console.error("Failed to load welders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWelders()
  }, [])

  // Filter welders based on search query
  const filteredWelders = useMemo(() => {
    if (!searchQuery.trim()) return welders

    const query = searchQuery.toLowerCase()
    return welders.filter(welder =>
      welder.operatorName.toLowerCase().includes(query) ||
      welder.operatorId.toLowerCase().includes(query) ||
      welder.iqamaPassport.toLowerCase().includes(query)
    )
  }, [welders, searchQuery])

  // Find selected welder
  const selectedWelder = useMemo(() => {
    return welders.find(welder => welder.id === value)
  }, [welders, value])

  const handleSelect = (welderId: string) => {
    const welder = welders.find(w => w.id === welderId)
    if (welder) {
      onValueChange(welderId, welder)
      setOpen(false)
      setSearchQuery("")
    }
  }

  const handleClear = () => {
    onValueChange(undefined, undefined)
    setSearchQuery("")
  }

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
            <p>
              {selectedWelder.operatorId}
            </p>
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
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading welders...
              </div>
            ) : filteredWelders.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? "No welders found." : "No welders available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredWelders.map((welder) => (
                  <CommandItem
                    key={welder.id}
                    value={welder.id}
                    onSelect={() => handleSelect(welder.id!)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <p>
                        {welder.operatorId}
                      </p>
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
