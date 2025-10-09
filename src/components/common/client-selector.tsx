"use client"

import { useState, useMemo, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Client } from "@/services/clients.service"
import { useClients } from "@/hooks/use-clients"

interface ClientSelectorProps {
  value?: string // client ID
  onValueChange: (clientId: string | undefined, client: Client | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedClient?: Client // Pass the selected client data directly
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder = "Select client...",
  disabled = false,
  className,
  selectedClient: propSelectedClient
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Debounce search query to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Use the optimized useClients hook - only load when popover is open
  const { data: clientsData, isLoading: loading } = useClients(1, debouncedSearchQuery.trim() || undefined, open)
  
  const clients = clientsData?.results ?? []

  // No need for client-side filtering since we're using server-side search
  const filteredClients = clients

  // Find selected client - use prop if available, otherwise find from clients array
  const selectedClient = useMemo(() => {
    // If we have a prop selected client and it matches the value, use it
    if (propSelectedClient && propSelectedClient.id.toString() === value) {
      return propSelectedClient
    }
    // Otherwise, try to find from the clients array
    return clients.find(client => client.id.toString() === value)
  }, [clients, value, propSelectedClient])

  const handleSelect = (clientId: string) => {
    const client = clients.find(c => c.id.toString() === clientId)
    if (client) {
      onValueChange(clientId, client)
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
          {selectedClient ? (
            <p className="max-w-[280px] truncate">
              {selectedClient.client_name}
            </p>
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
              placeholder="Search clients..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading || (searchQuery !== debouncedSearchQuery) ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery !== debouncedSearchQuery ? "Searching..." : "Loading clients..."}
              </div>
            ) : filteredClients.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No clients found for "${searchQuery}".` : "No clients available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id.toString()}
                    onSelect={() => handleSelect(client.id.toString())}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <p>
                        {client.client_name}
                      </p>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === client.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {selectedClient && (
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
