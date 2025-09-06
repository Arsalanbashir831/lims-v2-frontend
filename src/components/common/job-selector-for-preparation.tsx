"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { sampleInformationService, SampleInformation } from "@/lib/sample-information"

interface JobSelectorForPreparationProps {
  value?: string // job ID
  onValueChange: (jobId: string | undefined, job: SampleInformation | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedJob?: SampleInformation // Pass the selected job data directly
}

export function JobSelectorForPreparation({
  value,
  onValueChange,
  placeholder = "Select job...",
  disabled = false,
  className,
  selectedJob: propSelectedJob
}: JobSelectorForPreparationProps) {
  const [open, setOpen] = useState(false)
  const [jobs, setJobs] = useState<SampleInformation[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load jobs based on search query
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        // If no search query, load all jobs; otherwise search
        const response = searchQuery.trim() 
          ? await sampleInformationService.search(searchQuery, 1)
          : await sampleInformationService.getAll(1)
        
        setJobs(response.results)
      } catch (error) {
        console.error("Failed to load jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadJobs()
    }, searchQuery.trim() ? 300 : 0) // No delay for initial load

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // No need for client-side filtering since we're using server-side search
  const filteredJobs = jobs

  // Find selected job - use prop if available, otherwise find from jobs array
  const selectedJob = useMemo(() => {
    // If we have a prop selected job and it matches the value, use it
    if (propSelectedJob && propSelectedJob.job_id === value) {
      return propSelectedJob
    }
    // Otherwise, try to find from the jobs array
    return jobs.find(job => job.job_id === value)
  }, [jobs, value, propSelectedJob])

  const handleSelect = (jobId: string) => {
    const job = jobs.find(j => j.job_id === jobId)
    if (job) {
      onValueChange(jobId, job)
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
          {selectedJob ? (
            <div className="flex flex-col items-start">
              <p className="font-medium">{selectedJob.job_id}</p>
              <p className="text-sm text-muted-foreground">{selectedJob.project_name}</p>
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
              placeholder="Search jobs..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No jobs found for "${searchQuery}".` : "No jobs available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredJobs.map((job) => (
                  <CommandItem
                    key={job.job_id}
                    value={job.job_id}
                    onSelect={() => handleSelect(job.job_id)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{job.job_id}</p>
                        <p className="text-sm text-muted-foreground">{job.project_name}</p>
                        <p className="text-xs text-muted-foreground">{job.client_name}</p>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === job.job_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {selectedJob && (
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
