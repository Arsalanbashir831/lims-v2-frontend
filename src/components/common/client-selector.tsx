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
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder = "Select client...",
  disabled = false,
  className
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        const data = await clientService.getAll()
        setClients(data)
      } catch (error) {
        console.error("Failed to load clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients

    const query = searchQuery.toLowerCase()
    return clients.filter(client =>
      client.name.toLowerCase().includes(query)
    )
  }, [clients, searchQuery])

  // Find selected client
  const selectedClient = useMemo(() => {
    return clients.find(client => client.id === value)
  }, [clients, value])

  const handleSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
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
              {selectedClient.name}
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
                {searchQuery ? "No clients found." : "No clients available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => handleSelect(client.id!)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <p>
                        {client.name}
                      </p>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === client.id ? "opacity-100" : "opacity-0"
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
