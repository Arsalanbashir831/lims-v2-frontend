"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { clientService, Client } from "@/lib/clients"

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
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load clients based on search query
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        // If no search query, load all clients; otherwise search
        const response = searchQuery.trim() 
          ? await clientService.search(searchQuery, 1)
          : await clientService.getAll(1)
        
        console.log("Search query:", searchQuery)
        console.log("API response:", response)
        console.log("Clients set:", response.results)
        
        setClients(response.results)
      } catch (error) {
        console.error("Failed to load clients:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadClients()
    }, searchQuery.trim() ? 300 : 0) // No delay for initial load

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

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
            <p>
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
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading clients...
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
