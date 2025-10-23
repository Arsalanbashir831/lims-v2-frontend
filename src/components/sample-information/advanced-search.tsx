"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"

interface AdvancedSearchProps {
  onSearch: (filters: {
    query: string
    jobId: string
    projectName: string
    clientName: string
    endUser: string
  }) => void
  onClear: () => void
  onSearchChange?: (filters: {
    query: string
    jobId: string
    projectName: string
    clientName: string
    endUser: string
  }) => void
  isLoading?: boolean
}

export function AdvancedSearch({ onSearch, onClear, onSearchChange, isLoading = false }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    query: "",
    jobId: "",
    projectName: "",
    clientName: "",
    endUser: ""
  })

  const handleInputChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    
    // Call onSearchChange for real-time search if provided
    if (onSearchChange) {
      onSearchChange(newFilters)
    }
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      query: "",
      jobId: "",
      projectName: "",
      clientName: "",
      endUser: ""
    })
    onClear()
  }

  const hasActiveFilters = Object.values(filters).some(value => value.trim() !== "")

  return (
    <Card className="w-full py-2 px-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <CardTitle className="text-lg">Search Sample Information</CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pb-2">
            {/* General Search */}
            <div className="space-y-2">
              <Label htmlFor="query">General Search</Label>
              <Input
                id="query"
                placeholder="Search by any field..."
                value={filters.query}
                onChange={(e) => handleInputChange("query", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Job ID */}
              <div className="space-y-2">
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  placeholder="e.g., MTL-2025-0001"
                  value={filters.jobId}
                  onChange={(e) => handleInputChange("jobId", e.target.value)}
                />
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name..."
                  value={filters.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                />
              </div>

              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name..."
                  value={filters.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                />
              </div>

              {/* End User */}
              <div className="space-y-2">
                <Label htmlFor="endUser">End User</Label>
                <Input
                  id="endUser"
                  placeholder="Enter end user..."
                  value={filters.endUser}
                  onChange={(e) => handleInputChange("endUser", e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={handleClear}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Active filters:</span>
                  {Object.entries(filters).map(([key, value]) => 
                    value.trim() && (
                      <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
                        {key}: {value}
                        <button
                          onClick={() => handleInputChange(key as keyof typeof filters, "")}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
