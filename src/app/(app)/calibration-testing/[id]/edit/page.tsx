"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CalibrationTestingForm } from "@/components/calibration-testing/form"
import { calibrationTestingService, CalibrationTesting } from "@/services/calibration-testing.service"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export default function EditCalibrationTestingPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<CalibrationTesting | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  const id = params?.id as string
  const { data, isLoading } = useQuery({
    queryKey: ['calibration-tests', id],
    queryFn: () => calibrationTestingService.getById(id),
    enabled: !!id,
  })

  if (isLoading || !data) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Calibration Testing" description="Edit the calibration testing details" label={null} href={ROUTES.APP.CALIBRATION_TESTING.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <CalibrationTestingForm initial={data} readOnly={!isEditing} />
    </div>
  )
}


