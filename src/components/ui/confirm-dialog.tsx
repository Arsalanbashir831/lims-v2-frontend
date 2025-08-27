"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function ConfirmDialog({ open, onOpenChange, title = "Are you sure?", description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


