"use client"

import { useState, useMemo, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useTestMethods } from "@/hooks/use-test-methods"

interface TestMethodsSelectorProps {
  value?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxSelections?: number
  selectedMethods?: Array<{ id: string; test_name: string }>
}

export function TestMethodsSelector({ 
  value = [], 
  onValueChange, 
  placeholder = "Select test methods...", 
  disabled = false,
  className,
  maxSelections,
  selectedMethods = []
}: TestMethodsSelectorProps) {
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

  // Use the optimized useTestMethods hook - only load when popover is open or when we have selected values
  const shouldLoad = open || value.length > 0
  const { data: testMethodsData, isLoading: loading } = useTestMethods(1, debouncedSearchQuery.trim() || undefined, shouldLoad)
  
  const testMethods = testMethodsData?.results ?? []


  // Get selected test methods data - filter from loaded testMethods
  const selectedTestMethods = useMemo(() => {
    return testMethods.filter(method => value.includes(method.id))
  }, [testMethods, value])

  const handleSelect = (methodId: string) => {
    const isSelected = value.includes(methodId)
    let newValue: string[]
    
    if (isSelected) {
      // Remove from selection
      newValue = value.filter(id => id !== methodId)
    } else {
      // Add to selection (check max selections limit)
      if (maxSelections && value.length >= maxSelections) {
        return // Don't add if max selections reached
      }
      newValue = [...value, methodId]
    }
    
    onValueChange(newValue)
  }

  const handleRemove = (methodId: string) => {
    const newValue = value.filter(id => id !== methodId)
    onValueChange(newValue)
  }


  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            <span className="text-muted-foreground">
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search test methods..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading || (searchQuery !== debouncedSearchQuery) ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  {searchQuery !== debouncedSearchQuery ? "Searching..." : "Loading test methods..."}
                </div>
              ) : testMethods.length === 0 ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  {searchQuery ? `No test methods found for "${searchQuery}".` : "No test methods available."}
                </div>
              ) : (
                <CommandGroup>
                  {testMethods.map((method) => {
                    const isSelected = value.includes(method.id)
                    const isDisabled = !isSelected && maxSelections && value.length >= maxSelections
                    
                    return (
                      <CommandItem
                        key={method.id}
                        value={method.id}
                        onSelect={() => handleSelect(method.id)}
                        disabled={!!isDisabled}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{method.test_name}</span>
                          {method.test_description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {method.test_description}
                            </span>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {method.test_columns?.length || 0} columns
                            </Badge>
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected test methods display */}
      {selectedTestMethods.length > 0 && (
        <div className="space-y-2">
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-1">
              {selectedTestMethods.map((method) => (
                <Badge
                  key={method.id}
                  variant="default"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="truncate max-w-[150px]">{method.test_name}</span>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemove(method.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
