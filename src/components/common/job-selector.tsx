"use client"

import { useState, useMemo, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSampleInformation } from "@/hooks/use-sample-information"
import { SampleInformationResponse } from "@/services/sample-information.service"

interface Job {
  job_id: string
  project_name: string
  client_name: string
}

interface JobSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  onJobSelect?: (job: any) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedJob?: Job
}

export function JobSelector({ 
  value = "", 
  onValueChange, 
  onJobSelect,
  placeholder = "Select job...", 
  disabled = false,
  className,
  selectedJob
}: JobSelectorProps) {
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

  // Use the optimized useSampleInformation hook - only load when popover is open
  const { data: jobsData, isLoading: loading } = useSampleInformation(1, debouncedSearchQuery.trim() || undefined)
  
  const jobs: any[] = jobsData?.results ?? []

  // Find selected job
  const selectedJobData = useMemo(() => {
    if (selectedJob) {
      return selectedJob
    }
    return jobs.find(job => job.id === value)
  }, [jobs, value, selectedJob])

  const handleSelect = (jobDocumentId: string) => {
    onValueChange(jobDocumentId === value ? "" : jobDocumentId)
    if (onJobSelect && jobDocumentId !== value) {
      const selectedJob = jobs.find(job => job.id === jobDocumentId)
      if (selectedJob) {
        onJobSelect(selectedJob)
      }
    }
    setOpen(false)
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
          {selectedJobData ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedJobData.job_id}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {selectedJobData.project_name}
              </span>
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
            placeholder="Search jobs..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading || (searchQuery !== debouncedSearchQuery) ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery !== debouncedSearchQuery ? "Searching..." : "Loading jobs..."}
              </div>
            ) : jobs.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No jobs found for "${searchQuery}".` : "No jobs available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {jobs.map((job) => (
                  <CommandItem
                    key={job.id}
                    value={job.id}
                    onSelect={() => handleSelect(job.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === job.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{job.job_id}</span>
                      <span className="text-xs text-muted-foreground">
                        {job.project_name} - {job.client_name}
                      </span>
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
