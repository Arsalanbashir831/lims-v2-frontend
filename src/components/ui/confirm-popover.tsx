"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"

type ConfirmPopoverProps = {
  trigger: React.ReactNode
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

export function ConfirmPopover({ trigger, title = "Delete this item?", description = "This action cannot be undone.", confirmText = "Delete", cancelText = "Cancel", onConfirm, }: ConfirmPopoverProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <h2 className="mb-1 font-semibold">{title}</h2>
        <p className="text-sm mb-3">{description}</p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>{cancelText}</Button>
          <Button variant="destructive" size="sm" onClick={() => { onConfirm(); setOpen(false) }}>{confirmText}</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}


