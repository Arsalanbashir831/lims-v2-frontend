"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { WelderQualificationForm, type WelderQualificationData } from "@/components/welders/welder-qualification-form"

interface EditWelderQualificationPageProps {
  params: {
    id: string
  }
}

// Mock data - replace with actual data fetching
const mockData: WelderQualificationData = {
  id: "1",
  clientName: "GULF HEAVY INDUSTRIES COMPANY",
  welderImage: null,
  welderName: "NASIR MAHMOOD",
  wpsIdentification: "GHI-259-01 Rev.00",
  iqamaId: "2542297615",
  qualificationStandard: "ASME SEC IX(2023)",
  baseMetalSpec: "SA-516 Gr.70NN to SA-334 Gr.6",
  weldType: "GROOVE + SEAL WELD",
  welderIdNo: "W-533",
  jointType: "GROOVE",
  dateOfTest: "2025-08-18",
  certificateRefNo: "certificate 119",
  welderVariables: [
    { id: "1", name: "Welder Process(es)", actualValue: "GTAW", rangeQualified: "GTAW" },
    { id: "2", name: "Types of Welder (manual/semi auto)", actualValue: "manual", rangeQualified: "Manual" },
    { id: "3", name: "Backing (With/without)", actualValue: "With", rangeQualified: "With/Without" },
    { id: "4", name: "Types of weld", actualValue: "Seal Weld", rangeQualified: "Seal Weld" },
    { id: "5", name: "Product Types(Plate or Pipe)", actualValue: "Pipe", rangeQualified: "Pipe/Plate" },
    { id: "6", name: "Diameter of Pipe", actualValue: "19.05mm (OD)", rangeQualified: "Unlimited" },
    { id: "7", name: "Base Metal P Number to P Number", actualValue: "P1 - P1", rangeQualified: "P1 Thru P15F, P34 & P41 Thru P49 TO Same" },
    { id: "8", name: "Filler Metal or electrode specification", actualValue: "A5.18", rangeQualified: "-" },
    { id: "9", name: "Filler Meta F-Number(S)", actualValue: "F6", rangeQualified: "All F-6 Classification" },
    { id: "10", name: "Filer Metal addition/Deletion (GTAW/PAW)", actualValue: "N/A", rangeQualified: "N/A" },
    { id: "11", name: "Consumable Insert (GTAW or PAW)", actualValue: "N/A", rangeQualified: "N/A" },
    { id: "12", name: "Deposit thickness for each process", actualValue: "2.11mm", rangeQualified: "Upto 4.22 mm" },
    { id: "13", name: "Welder position", actualValue: "SP", rangeQualified: "SP, F" },
    { id: "14", name: "Vertical Progression", actualValue: "UPHILL", rangeQualified: "UPHILL" },
    { id: "15", name: "Type of Fuel Gas(OFW)", actualValue: "N/A", rangeQualified: "N/A" },
    { id: "16", name: "Insert gas backing(GTAW,PAW,GMAW)", actualValue: "ARGON", rangeQualified: "ARGON" },
    { id: "17", name: "Transfer Mode( spary, globular, SHORT)", actualValue: "N/A", rangeQualified: "N/A" },
    { id: "18", name: "Current Type/Polarity(AC,DCEP,DCEN)", actualValue: "DCEN", rangeQualified: "DCEN" },
  ],
  testsConducted: [
    { id: "1", testType: "Visual Inspection", reportNo: "N/A", results: "ACC", isReportChecked: false },
    { id: "2", testType: "NDT", reportNo: "G020/160825/001", results: "ACC", isReportChecked: false },
    { id: "3", testType: "Mechanical Test", reportNo: "CERT-2025-0154", results: "ACC", isReportChecked: false },
  ],
  certificationStatement: "ASME SEC IX Ed(2023).",
  testingWitnessed: "MOHAMMED INAYAT",
  testSupervisor: "MUHAMMED IRSHAD ALI"
}

export default function EditWelderQualificationPage({ params }: EditWelderQualificationPageProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState<WelderQualificationData | null>(null)

  useEffect(() => {
    // TODO: Fetch actual data based on params.id
    setData(mockData)
  }, [params.id])

  const handleSubmit = (formData: WelderQualificationData) => {
    // TODO: Save to localStorage or API
    console.log('Updating welder qualification data:', formData)
    
    setIsEditing(false)
    // Optionally update local state or refetch data
    setData(formData)
  }

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
    }
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Edit' : 'View'} Welder Qualification Certificate
            </h1>
            <p className="text-muted-foreground">
              Certificate ID: {params.id}
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <WelderQualificationForm
        initialData={data}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
