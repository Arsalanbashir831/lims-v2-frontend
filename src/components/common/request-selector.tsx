"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { samplePreparationService } from "@/lib/sample-preparation-new"

interface Request {
  id?: string
  prepNo?: string
  request_id: string
  job?: string
  job_id?: string
  job_project_name?: string
  request_description?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  test_items_count?: number
  total_specimens?: number
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
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load requests based on search query
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        // If no search query, load all requests; otherwise search
        const response = searchQuery.trim() 
          ? await samplePreparationService.search(searchQuery, 1)
          : await samplePreparationService.getAll(1)
          
        // Convert API response to Request interface
        const convertedRequests: Request[] = response.results.map((item: any) => ({
          id: item.id,
          prepNo: item.prepNo,
          request_id: item.request_id,
          job: item.job,
          job_id: item.job_id,
          job_project_name: item.job_project_name,
          request_description: item.request_description,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: item.created_by,
          updated_by: item.updated_by,
          test_items_count: item.test_items_count,
          total_specimens: item.total_specimens,
        }))
        
        setRequests(convertedRequests)
      } catch (error) {
        console.error("Failed to load requests:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadRequests()
    }, searchQuery.trim() ? 300 : 0) // No delay for initial load

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // No need for client-side filtering since we're using server-side search
  const filteredRequests = requests

  // Find selected request - use prop if available, otherwise find from requests array
  const selectedRequest = useMemo(() => {
    // If we have a prop selected request and it matches the value, use it
    if (propSelectedRequest && (propSelectedRequest.id === value || propSelectedRequest.request_id === value)) {
      return propSelectedRequest
    }
    // Otherwise, try to find from the requests array
    return requests.find(request => request.id === value || request.request_id === value)
  }, [requests, value, propSelectedRequest])

  const handleSelect = (requestId: string) => {
    const request = requests.find(r => r.id === requestId || r.request_id === requestId)
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
              <p className="font-medium">{selectedRequest.request_id || selectedRequest.prepNo}</p>
              {selectedRequest.job_project_name && (
                <p className="text-xs text-muted-foreground">{selectedRequest.job_project_name}</p>
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
              placeholder="Search requests..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No requests found for "${searchQuery}".` : "No requests available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredRequests.map((request) => (
                  <CommandItem
                    key={request.request_id || request.id}
                    value={request.request_id || request.id}
                    onSelect={() => handleSelect(request.request_id || request.id || "")}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{request.request_id || request.prepNo}</p>
                        {request.job_project_name && (
                          <p className="text-xs text-muted-foreground">{request.job_project_name}</p>
                        )}
                        {request.test_items_count && (
                          <p className="text-xs text-muted-foreground">
                            {request.test_items_count} test items, {request.total_specimens || 0} specimens
                          </p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === (request.request_id || request.id) ? "opacity-100" : "opacity-0"
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
