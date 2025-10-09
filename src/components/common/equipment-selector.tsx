"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEquipments } from "@/hooks/use-equipments"

interface Equipment {
  id: string
  equipment_name: string
  equipment_serial?: string | null
  status?: string | null
  last_verification?: string | Date | null
  verification_due?: string | Date | null
  remarks?: string | null
  is_active?: boolean
}

interface EquipmentSelectorProps {
  value?: string // equipment ID
  onValueChange: (equipmentId: string | undefined, equipment: Equipment | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedEquipment?: Equipment // Pass the selected equipment data directly
}

export function EquipmentSelector({
  value,
  onValueChange,
  placeholder = "Select equipment...",
  disabled = false,
  className,
  selectedEquipment: propSelectedEquipment
}: EquipmentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Use React Query hook for equipment data with caching
  const { data: equipmentsData, isLoading: loading, isFetching } = useEquipments(1, searchQuery)
  const equipments = equipmentsData?.results || []

  // Find selected equipment - use prop if available, otherwise find from equipments array
  const selectedEquipment = useMemo(() => {
    // If we have a prop selected equipment and it matches the value, use it
    if (propSelectedEquipment && propSelectedEquipment.id === value) {
      return propSelectedEquipment
    }
    // Otherwise, try to find from the equipments array
    return equipments.find(equipment => equipment.id === value)
  }, [equipments, value, propSelectedEquipment])

  // No need for client-side filtering since we're using server-side search
  const filteredEquipments = equipments

  const handleSelect = (equipmentId: string) => {
    const equipment = equipments.find(e => e.id === equipmentId)
    if (equipment) {
      onValueChange(equipmentId, equipment)
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
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedEquipment ? (
            <div className="flex flex-col items-start">
              <p className="font-medium">{selectedEquipment.equipment_name}</p>
              {selectedEquipment.equipment_serial && (
                <p className="text-xs text-muted-foreground">Serial: {selectedEquipment.equipment_serial}</p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b">
           <CommandInput
              placeholder="Search equipments..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading equipments...
              </div>
            ) : filteredEquipments.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No equipments found for "${searchQuery}".` : "No equipments available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredEquipments.map((equipment) => (
                  <CommandItem
                    key={equipment.id}
                    value={equipment.id}
                    onSelect={() => handleSelect(equipment.id)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{equipment.equipment_name}</p>
                        {equipment.equipment_serial && (
                          <p className="text-xs text-muted-foreground">
                            Serial: {equipment.equipment_serial}
                          </p>
                        )}
                        {equipment.status && (
                          <p className="text-xs text-muted-foreground">
                            Status: {equipment.status}
                          </p>
                        )}
                        {equipment.last_verification && (
                          <p className="text-xs text-muted-foreground">
                            Last Verified: {new Date(equipment.last_verification).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === equipment.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {selectedEquipment && (
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
