"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function AdvancedSearch({
  onSearch,
  isLoading = false,
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch(""); // Trigger search with empty query to show all data
  };

  const hasActiveSearch = searchQuery.trim() !== "";

  return (
    <>
      <div className="flex items-center w-full gap-2">
        <Input
          placeholder="Search by Job ID, Project, Client, or Request..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {hasActiveSearch && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </>
  );
}
