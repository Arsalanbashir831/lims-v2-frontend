"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type FilterSearchProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
  className?: string
  inputClassName?: string
}

export function FilterSearch({ placeholder = "Search...", value = "", onChange, debounceMs = 250, className, inputClassName }: FilterSearchProps) {
  const [term, setTerm] = useState(value)

  useEffect(() => {
    setTerm(value)
  }, [value])

  useEffect(() => {
    const id = setTimeout(() => {
      onChange?.(term)
    }, debounceMs)
    return () => clearTimeout(id)
  }, [term, debounceMs, onChange])

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Input
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className={`max-w-sm ${inputClassName ?? ""}`}
      />
      {term ? (
        <Button variant="ghost" size="icon" onClick={() => setTerm("")}> 
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}


