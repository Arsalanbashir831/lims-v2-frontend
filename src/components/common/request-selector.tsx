"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSamplePreparations } from "@/hooks/use-sample-preparations"

interface Request {
  id: string
  request_no: string
  sample_lots: Array<{
    item_description: string
    planned_test_date: string | null
    dimension_spec: string | null
    request_by: string | null
    remarks: string | null
    sample_lot_id: string
    test_method: {
      test_method_oid: string
      test_name: string
    }
    job_id: string
    item_no: string
    client_name: string | null
    project_name: string | null
    specimens: Array<{
      specimen_oid: string
      specimen_id: string
    }>
    specimens_count: number
  }>
  sample_lots_count: number
  created_at: string
  updated_at: string
}

interface RequestSelectorProps {
  value?: string // request ID
  onValueChange: (requestId: string | undefined, request: Request | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedRequest?: Request // Pass the selected request data directly
}

export function RequestSelector({
  value,
  onValueChange,
  placeholder = "Select request...",
  disabled = false,
  className,
  selectedRequest: propSelectedRequest
}: RequestSelectorProps) {
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

  // Use the optimized useSamplePreparations hook - only load when popover is open
  const { data: requestsData, isLoading: loading } = useSamplePreparations(1, debouncedSearchQuery.trim() || undefined, open)
  
  const requests: Request[] = requestsData?.data ?? []

  // Find selected request - use prop if available, otherwise find from requests array
  const selectedRequest = useMemo(() => {
    // If we have a prop selected request and it matches the value, use it
    if (propSelectedRequest && propSelectedRequest.id === value) {
      return propSelectedRequest
    }
    // Otherwise, try to find from the requests array
    return requests.find(request => request.id === value)
  }, [requests, value, propSelectedRequest])

  const handleSelect = (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (request) {
      onValueChange(requestId, request)
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
          {selectedRequest ? (
            <div className="flex flex-col items-start">
              <p className="font-medium">{selectedRequest.request_no}</p>
              {selectedRequest.sample_lots?.[0]?.project_name && (
                <p className="text-xs text-muted-foreground">{selectedRequest.sample_lots[0].project_name}</p>
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
          <CommandInput 
            placeholder="Search requests..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading || (searchQuery !== debouncedSearchQuery) ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery !== debouncedSearchQuery ? "Searching..." : "Loading requests..."}
              </div>
            ) : requests.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No requests found for "${searchQuery}".` : "No requests available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {requests.map((request) => (
                  <CommandItem
                    key={request.id}
                    value={request.id}
                    onSelect={() => handleSelect(request.id)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{request.request_no}</p>
                        {request.sample_lots?.[0]?.project_name && (
                          <p className="text-xs text-muted-foreground">{request.sample_lots[0].project_name}</p>
                        )}
                        {request.sample_lots_count && (
                          <p className="text-xs text-muted-foreground">
                            {request.sample_lots_count} sample lots, {request.sample_lots.reduce((total, lot) => total + lot.specimens_count, 0)} specimens
                          </p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === request.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {selectedRequest && (
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
