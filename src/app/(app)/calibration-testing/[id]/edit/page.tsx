"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CalibrationTestingForm } from "@/components/calibration-testing/form"
import { getCalibrationTest, CalibrationTest } from "@/lib/calibration-testing"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"

export default function EditCalibrationTestingPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<CalibrationTest | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (params?.id) setRecord(getCalibrationTest(params.id))
  }, [params?.id])

  if (!record) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Calibration Testing" description="Edit the calibration testing details" label={null} href={ROUTES.APP.CALIBRATION_TESTING.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <CalibrationTestingForm initial={record} readOnly={!isEditing} />
    </div>
  )
}


