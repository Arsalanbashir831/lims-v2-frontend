"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus } from "lucide-react"
import { testMethodService, CreateTestMethodData, UpdateTestMethodData } from "@/services/test-methods.service"
import { TestMethod } from "@/lib/schemas/test-method"
import { toast } from "sonner"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

type Props = {
  initial?: TestMethod
  readOnly?: boolean
}

export function TestMethodForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState(initial?.test_name ?? "")
  const [description, setDescription] = useState(initial?.test_description ?? "")
  const [comments, setComments] = useState(initial?.comments ?? "")
  const [columns, setColumns] = useState<string[]>(() => {
    if (initial?.test_columns && initial.test_columns.length > 0) {
      return initial.test_columns
    }
    return [""]
  })
  const [hasImage, setHasImage] = useState<boolean>(initial?.hasImage ?? false)
  const isEditing = useMemo(() => Boolean(initial), [initial])

  useEffect(() => {
    if (!columns.length) setColumns([""])
  }, [columns.length])

  // Update columns when initial data changes (for editing)
  useEffect(() => {
    if (initial?.test_columns && initial.test_columns.length > 0) {
      setColumns(initial.test_columns)
    }
  }, [initial?.test_columns])

  const onRemoveColumn = (idx: number) => setColumns((c) => c.filter((_, i) => i !== idx))
  const onChangeColumn = (idx: number, value: string) => setColumns((c) => c.map((v, i) => (i === idx ? value : v)))
  const onInsertColumnAfter = (idx: number) =>
    setColumns((c) => {
      const next = [...c]
      next.splice(idx + 1, 0, "")
      return next
    })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    const cleanedColumns = columns
      .map((c) => c.trim())
      .filter(c => c && c.length > 0)

    if (cleanedColumns.length === 0) {
      toast.error("At least one test column is required")
      return
    }

    const payload: CreateTestMethodData = {
      test_name: name.trim(),
      test_description: description.trim() || undefined,
      comments: comments.trim() || undefined,
      test_columns: cleanedColumns,
      hasImage,
      is_active: true,
    }

    if (isEditing && initial) {
      testMethodService.update(String(initial.id), payload as UpdateTestMethodData)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['test-methods'] })
          toast.success("Test method updated");
          router.push(ROUTES.APP.TEST_METHODS.ROOT)
        })
        .catch(() => toast.error("Failed to update"))
      return
    }

    testMethodService.create(payload)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['test-methods'] })
        toast.success("Test method created");
        router.push(ROUTES.APP.TEST_METHODS.ROOT)
      })
      .catch(() => toast.error("Failed to create"))
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Test columns ({columns.filter(c => c.trim()).length} filled)</Label>
            <div className="grid gap-3">
              {columns.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={`Column ${idx + 1}`}
                    value={col}
                    onChange={(e) => onChangeColumn(idx, e.target.value)}
                    disabled={readOnly}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Insert column after ${idx + 1}`}
                    onClick={() => onInsertColumnAfter(idx)}
                    title="Add after"
                    disabled={readOnly}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <ConfirmPopover
                    title={`Remove column ${idx + 1}?`}
                    onConfirm={() => onRemoveColumn(idx)}
                    trigger={
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove column" disabled={readOnly}>
                        <X className="size-4" />
                      </Button>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} disabled={readOnly} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="hasImage" checked={hasImage} onCheckedChange={(v) => setHasImage(Boolean(v))} disabled={readOnly} />
            <Label htmlFor="hasImage">Has image(s)</Label>
          </div>
        </CardContent>
      </Card>
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initial ? "Update Test Method" : "Save Test Method"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


