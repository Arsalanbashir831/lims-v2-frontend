"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { X, Plus } from "lucide-react"
import { createTestMethod, updateTestMethod, TestMethod } from "@/lib/test-methods"
import { toast } from "sonner"
import { ConfirmPopover } from "@/components/ui/confirm-popover"

type Props = {
  initial?: TestMethod
}

export function TestMethodForm({ initial }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [comments, setComments] = useState(initial?.comments ?? "")
  const [columns, setColumns] = useState<string[]>(initial?.columns ?? [""])
  const isEditing = useMemo(() => Boolean(initial), [initial])

  useEffect(() => {
    if (!columns.length) setColumns([""])
  }, [columns.length])

  const onAddColumn = () => setColumns((c) => [...c, ""]) 
  const onRemoveColumn = (idx: number) => setColumns((c) => c.filter((_, i) => i !== idx))
  const onChangeColumn = (idx: number, value: string) => setColumns((c) => c.map((v, i) => (i === idx ? value : v)))

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    const cleanedColumns = columns.map((c) => c.trim()).filter(Boolean)
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      comments: comments.trim() || undefined,
      columns: cleanedColumns,
    }

    if (isEditing && initial) {
      updateTestMethod(initial.id, payload)
      toast.success("Test method updated")
      router.push("/tests/methods")
      return
    }

    const created = createTestMethod(payload)
    toast.success("Test method created")
    router.push(`/tests/methods`)
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label>Test columns</Label>
            <div className="grid gap-3">
              {columns.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={`Column ${idx + 1}`}
                    value={col}
                    onChange={(e) => onChangeColumn(idx, e.target.value)}
                  />
                  <ConfirmPopover
                    title={`Remove column ${idx + 1}?`}
                    onConfirm={() => onRemoveColumn(idx)}
                    trigger={
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove column">
                        <X className="size-4" />
                      </Button>
                    }
                  />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={onAddColumn} className="w-fit">
                <Plus className="mr-2 size-4" /> Add column
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Button type="submit">{isEditing ? "Save changes" : "Create method"}</Button>
            <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}


