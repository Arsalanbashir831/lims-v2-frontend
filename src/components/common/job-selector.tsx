"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { sampleInformationService } from "@/lib/sample-information"

interface Job {
  job_id: string
  project_name: string
  client_name: string
}

interface JobSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  selectedJob?: Job
}

export function JobSelector({ 
  value = "", 
  onValueChange, 
  placeholder = "Select job...", 
  disabled = false,
  className,
  selectedJob
}: JobSelectorProps) {
  const [open, setOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load jobs based on search query with debouncing
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        // If no search query, load all jobs; otherwise search
        const response = searchQuery.trim() 
          ? await sampleInformationService.search(searchQuery, 1)
          : await sampleInformationService.getAll(1)
        
        console.log("Search query:", searchQuery)
        console.log("API response:", response)
        console.log("Jobs set:", response.results)
        
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

  // Find selected job
  const selectedJobData = useMemo(() => {
    if (selectedJob) {
      return selectedJob
    }
    return jobs.find(job => job.job_id === value)
  }, [jobs, value, selectedJob])

  const handleSelect = (jobId: string) => {
    onValueChange(jobId === value ? "" : jobId)
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
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? `No jobs found for "${searchQuery}".` : "No jobs available."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {jobs.map((job) => (
                  <CommandItem
                    key={job.job_id}
                    value={job.job_id}
                    onSelect={() => handleSelect(job.job_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === job.job_id ? "opacity-100" : "opacity-0"
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
