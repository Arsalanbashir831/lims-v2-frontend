"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SampleReceivingForm, type SampleReceivingFormData } from "@/components/sample-receiving/form"
import { getSampleReceiving, updateSampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function EditSampleReceivingPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<SampleReceivingFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    const rec = getSampleReceiving(id)
    if (rec) {
      setInitial({
        sampleId: rec.sampleId,
        projectName: rec.projectName,
        clientName: rec.clientName,
        endUser: rec.endUser,
        phone: rec.phone,
        receiveDate: rec.receiveDate,
        storageLocation: rec.storageLocation,
        remarks: rec.remarks,
        items: rec.items,
        numItems: rec.numItems, // not used directly by form
      } as any)
    }
  }, [id])

  const handleSubmit = (data: SampleReceivingFormData) => {
    if (!id) return
    updateSampleReceiving(id, {
      projectName: data.projectName,
      clientName: data.clientName,
      endUser: data.endUser,
      phone: data.phone,
      receiveDate: data.receiveDate,
      storageLocation: data.storageLocation,
      remarks: data.remarks,
      numItems: data.items.length,
      items: data.items,
    })
    toast.success("Sample updated")
    setIsEditing(false)
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Sample Receiving" description="Edit the sample receiving details" label={null} href={ROUTES.APP.SAMPLE_RECEIVING.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)} ><PencilIcon className="w-4 h-4" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4" /> Cancel</Button>
        )}
      </FormHeader>
      {initial ? (
        <SampleReceivingForm initialData={initial} onSubmit={handleSubmit} readOnly={!isEditing} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

    </div>
  )
}
