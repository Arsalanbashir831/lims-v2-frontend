"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServerPaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ServerPagination({
  currentPage,
  totalCount,
  pageSize = 20,
  hasNext,
  hasPrevious,
  onPageChange,
  isLoading = false
}: ServerPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const handleFirstPage = () => {
    if (hasPrevious && !isLoading) {
      onPageChange(1)
    }
  }

  const handlePreviousPage = () => {
    if (hasPrevious && !isLoading) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNext && !isLoading) {
      onPageChange(currentPage + 1)
    }
  }

  const handleLastPage = () => {
    if (hasNext && !isLoading) {
      onPageChange(totalPages)
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row items-center justify-between md:px-2 py-2">
      <div className="text-muted-foreground flex-1 text-sm self-start px-0">
        Showing {startItem} to {endItem} of {totalCount} entries
      </div>
      <div className="flex items-center justify-between space-x-6 lg:space-x-8 w-full md:w-auto">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden size-8 lg:flex" 
            onClick={handleFirstPage} 
            disabled={!hasPrevious || isLoading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="size-6 md:size-8" 
            onClick={handlePreviousPage} 
            disabled={!hasPrevious || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="size-6 md:size-8" 
            onClick={handleNextPage} 
            disabled={!hasNext || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden size-8 lg:flex" 
            onClick={handleLastPage} 
            disabled={!hasNext || isLoading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
