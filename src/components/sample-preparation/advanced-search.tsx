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
    clientName: string
    projectName: string
    specimenId: string
    dateFrom: string
    dateTo: string
  }) => void
  onClear: () => void
  isLoading?: boolean
}

export function AdvancedSearch({ onSearch, onClear, isLoading = false }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    query: "",
    jobId: "",
    clientName: "",
    projectName: "",
    specimenId: "",
    dateFrom: "",
    dateTo: ""
  })

  const handleInputChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      query: "",
      jobId: "",
      clientName: "",
      projectName: "",
      specimenId: "",
      dateFrom: "",
      dateTo: ""
    })
    onClear()
  }

  const hasActiveFilters = Object.values(filters).some(value => value.trim() !== "")

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <CardTitle className="text-lg">Search Sample Preparations</CardTitle>
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
          <CardContent className="space-y-4">
            {/* General Search */}
            <div className="space-y-2">
              <Label htmlFor="query">General Search</Label>
              <Input
                id="query"
                placeholder="Search by request number, description, request by, or remarks..."
                value={filters.query}
                onChange={(e) => handleInputChange("query", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Specimen ID */}
              <div className="space-y-2">
                <Label htmlFor="specimenId">Specimen ID</Label>
                <Input
                  id="specimenId"
                  placeholder="e.g., 1234, 5678"
                  value={filters.specimenId}
                  onChange={(e) => handleInputChange("specimenId", e.target.value)}
                />
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleInputChange("dateFrom", e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleInputChange("dateTo", e.target.value)}
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
