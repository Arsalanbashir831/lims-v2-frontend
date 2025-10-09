"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalibrationTesting, calibrationTestingService, CreateCalibrationTestingData, UpdateCalibrationTestingData } from "@/services/calibration-testing.service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

type Props = { initial?: CalibrationTesting, readOnly?: boolean }

export function CalibrationTestingForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = useMemo(() => Boolean(initial), [initial])

  const [equipmentName, setEquipmentName] = useState(initial?.equipmentName ?? "")
  const [equipmentSerial, setEquipmentSerial] = useState(initial?.equipmentSerial ?? "")
  const [vendor, setVendor] = useState((initial as any)?.calibrationVendor ?? "")
  const [calibrationDate, setCalibrationDate] = useState(initial?.calibrationDate ?? "")
  const [calibrationDueDate, setCalibrationDueDate] = useState(initial?.calibrationDueDate ?? "")
  const [certification, setCertification] = useState((initial as any)?.calibrationCertification ?? "")
  const [createdBy, setCreatedBy] = useState(initial?.createdBy ?? "")
  const [updatedBy, setUpdatedBy] = useState(initial?.updatedBy ?? "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!equipmentName.trim()) {
      toast.error("Equipment/Instrument Name is required")
      return
    }
    const payload: CreateCalibrationTestingData = {
      equipmentName: equipmentName.trim(),
      equipmentSerial: equipmentSerial.trim() || undefined,
      calibrationVendor: vendor.trim() || undefined,
      calibrationDate: calibrationDate || undefined,
      calibrationDueDate: calibrationDueDate || undefined,
      calibrationCertification: certification.trim() || undefined,
      createdBy: createdBy.trim() || undefined,
      updatedBy: updatedBy.trim() || undefined,
      remarks: remarks.trim() || undefined,
      is_active: true,
    }

    if (isEditing && initial) {
      calibrationTestingService.update(initial.id, payload as UpdateCalibrationTestingData)
        .then(() => { 
          queryClient.invalidateQueries({ queryKey: ['calibration-tests'] })
          toast.success("Record updated"); 
          router.push(ROUTES.APP.CALIBRATION_TESTING.ROOT) 
        })
        .catch(() => toast.error("Failed to update"))
      return
    }

    calibrationTestingService.create(payload)
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['calibration-tests'] })
        toast.success("Record created"); 
        router.push(ROUTES.APP.CALIBRATION_TESTING.ROOT) 
      })
      .catch(() => toast.error("Failed to create"))
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card className="shadow-none">
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="equipmentName">Equipment/Instrument Name</Label>
            <Input id="equipmentName" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} required disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="equipmentSerial">Equipment Serial #</Label>
              <Input id="equipmentSerial" value={equipmentSerial} onChange={(e) => setEquipmentSerial(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor">Calibration Vendor</Label>
              <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="calibrationDate">Calibration Date</Label>
              <Input id="calibrationDate" type="date" value={calibrationDate.toString()} onChange={(e) => setCalibrationDate(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calibrationDueDate">Calibration Due Date</Label>
              <Input id="calibrationDueDate" type="date" value={calibrationDueDate.toString()} onChange={(e) => setCalibrationDueDate(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certification">Calibration Certification</Label>
              <Input id="certification" value={certification} onChange={(e) => setCertification(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="createdBy">Created by</Label>
              <Input id="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="updatedBy">Updated by</Label>
              <Input id="updatedBy" value={updatedBy} onChange={(e) => setUpdatedBy(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} disabled={readOnly} />
          </div>
        </CardContent>
      </Card>
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initial ? "Update Calibration Testing" : "Save Calibration Testing"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


