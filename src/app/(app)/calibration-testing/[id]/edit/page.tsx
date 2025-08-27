"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CalibrationTestingForm } from "@/components/calibration-testing/form"
import { getCalibrationTest, CalibrationTest } from "@/lib/calibration-testing"

export default function EditCalibrationTestingPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<CalibrationTest | undefined>(undefined)

  useEffect(() => {
    if (params?.id) setRecord(getCalibrationTest(params.id))
  }, [params?.id])

  if (!record) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Edit Calibration Testing</h1>
      <CalibrationTestingForm initial={record} />
    </div>
  )
}


