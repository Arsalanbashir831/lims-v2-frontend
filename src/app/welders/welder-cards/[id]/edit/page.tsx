"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { WelderCardData, WelderCardForm } from "@/components/welders/welder-card-form"



// Mock data - replace with actual data fetching
const mockData: WelderCardData = {
  id: "1",
  company: "GULF HEAVY INDUSTRIES COMPANY",
  welderImage: null,
  welderName: "NASIR MAHMOOD",
  wpsNo: "GHI-259-01 Rev.00",
  iqamaId: "2542297615",
  welderId: "ASME SEC IX(2023)",
  cardNo: "SA-516 Gr.70NN to SA-334 Gr.6",
  process: "GROOVE + SEAL WELD",
  jointType: "W-533",
  verticalProgression: "2025-08-18",
  testPosition: "2025-08-18",
  positionQualified: "2025-08-18",
  testThickness: "2025-08-18",
  testDia: "2025-08-18",
  thicknessQualified: "2025-08-18",
  pNoQualified: "2025-08-18",
  diameterQualified: "2025-08-18",
  fNoQualified: "2025-08-18",
  fillerMetalElectrodeClassUsed: "2025-08-18",
  placeOfIssue: "2025-08-18",
  testMethod: "2025-08-18",
  dateOfTest: "2025-08-18",
  dateOfExp: "2025-08-18",
  authorisedBy: "2025-08-18",
  weldingInspector: "2025-08-18",
  certificationStatement: "ASME SEC IX Ed(2023).",
}

export default function EditWelderCardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState<WelderCardData | null>(null)

  useEffect(() => {
    // TODO: Fetch actual data based on params.id
    setData(mockData)
  }, [params.id])

  const handleSubmit = (formData: WelderCardData) => {
    // TODO: Save to localStorage or API
    console.log('Updating welder card data:', formData)

    setIsEditing(false)
    // Optionally update local state or refetch data
    setData(formData)
  }

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
    }
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <FormHeader title="Edit Welder Card" description="Edit the welder card" label={null} href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <WelderCardForm
        initialData={data}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
