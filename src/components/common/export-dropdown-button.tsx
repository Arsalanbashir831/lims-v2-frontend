"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, DownloadIcon, FileTextIcon, FileTypeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ExportOption = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void | Promise<void>
}

type Props = {
  options: ExportOption[]
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function ExportDropdownButton({
  options,
  disabled = false,
  loading = false,
  loadingText = "Exporting...",
  className,
  variant = "outline",
  size = "default"
}: Props) {
  const isDisabled = disabled || loading

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isDisabled}
          className={cn(
            "!border-primary text-primary !text-sm !font-normal !bg-primary/10 hover:!bg-primary/20 hover:!text-primary hover:!border-primary",
            className
          )}
        >
          <DownloadIcon className="h-4 w-4" />
          {loading ? loadingText : "Export"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={option.onClick}
            disabled={isDisabled}
          >
            <option.icon className="mr-2 h-4 w-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Pre-configured export options for common use cases
export const EXPORT_OPTIONS = {
  WORD: (onClick: () => void | Promise<void>) => ({
    label: "Export as Word",
    icon: FileTypeIcon,
    onClick
  }),
  PDF: (onClick: () => void | Promise<void>) => ({
    label: "Export as PDF", 
    icon: FileTextIcon,
    onClick
  })
}
