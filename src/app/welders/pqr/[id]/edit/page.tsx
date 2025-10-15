"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PQRForm, PQRFormData } from "@/components/pqr/form/pqr-form"
import { toast } from "sonner"
import { usePQR } from "@/hooks/use-pqr"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { PQR } from "@/services/pqr.service"

export default function EditPQRPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  // Load PQR data using the hook
  const { data: pqrResponse, isLoading, error } = usePQR(id || "")
  const pqrData = pqrResponse?.data

  // Set form type based on PQR type, default to 'asme' if not loaded yet
  const [formType, setFormType] = useState<"asme" | "api">(() => {
    if (pqrData?.type) {
      return pqrData.type === 'ASME_SEC_IX' ? 'asme' : 'api'
    }
    return 'asme' // default
  })
  
  const isAsme = useMemo(() => formType === "asme", [formType])

  // Transform backend PQR data to form format
  const [initialFormData, setInitialFormData] = useState<PQRFormData>({})

  useEffect(() => {
    if (pqrData) {
      console.log("=== PQR Edit Page: Received data from backend ===", pqrData)
      
      // Set form type based on PQR type
      const newFormType = pqrData.type === 'ASME_SEC_IX' ? 'asme' : 'api'
      setFormType(newFormType)
      
      // Transform PQR data to form format
      const formData = transformPQRToFormData(pqrData)
      console.log("=== PQR Edit Page: Transformed form data ===", formData)
      setInitialFormData(formData)
    }
  }, [pqrData])

  // Transform backend PQR data to form format
  function transformPQRToFormData(pqr: PQR): PQRFormData {
    const transformToDynamicData = (data: Record<string, string | number | boolean> | null | undefined) => {
      // If no data, return undefined so sections use their default data
      if (!data || Object.keys(data).length === 0) return undefined
      
      // Check if this is multi-column table data (keys like "row_0_columnname")
      const hasRowPrefix = Object.keys(data).some(key => key.startsWith('row_'))
      
      if (hasRowPrefix) {
        // This is multi-column table data
        // Group by row index
        const rowsMap = new Map<number, Record<string, any>>()
        
        Object.entries(data).forEach(([key, value]) => {
          const match = key.match(/^row_(\d+)_(.+)$/)
          if (match) {
            const rowIndex = parseInt(match[1])
            const columnName = match[2]
            
            if (!rowsMap.has(rowIndex)) {
              rowsMap.set(rowIndex, { id: `row_${rowIndex}` })
            }
            
            rowsMap.get(rowIndex)![columnName] = value
          }
        })
        
        // Convert map to array and return without columns (sections will use their default columns)
        const rows = Array.from(rowsMap.values()) as any[]
        return { columns: undefined as any, data: rows as any }
      } else {
        // This is label-value table data
        const columns = [
          { 
            id: 'label', 
            header: 'Parameter',
            accessorKey: 'label',
            type: 'label' as const
          },
          { 
            id: 'value', 
            header: 'Value',
            accessorKey: 'value',
            type: 'input' as const
          }
        ]
        
        const rows = Object.entries(data).map(([key, value]) => ({
          id: key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: value || ''
        }))
        
        return { columns, data: rows }
      }
    }

    // Transform basic_info with proper field mapping
    const transformBasicInfo = (basicInfo: Record<string, string | number | boolean> | null | undefined, pqr: PQR) => {
      const columns = [
        { 
          id: 'fieldDesc', 
          header: 'Description',
          accessorKey: 'description',
          type: 'label' as const
        },
        { 
          id: 'fieldVal', 
          header: 'Details',
          accessorKey: 'value',
          type: 'input' as const
        }
      ]
      
      // Map backend fields to form fields - matching what HeaderInfoSection expects
      // Helper to get value from basicInfo using multiple possible keys
      const getValue = (...keys: string[]): string => {
        if (!basicInfo) return ''
        for (const key of keys) {
          const value = basicInfo[key]
          if (value) return String(value)
        }
        return ''
      }
      
      const rows = [
        { id: 's1r1', description: 'Contractor Name', value: getValue('contractor_name', 'qualified_by') },
        { id: 's1r2', description: 'Document No.', value: getValue('document_no') },
        { id: 's1r3', description: 'PQR No.', value: getValue('pqr_no', 'pqr_number') || pqr.id || '' },
        { id: 's1r4', description: 'Page No.', value: getValue('page_no') },
        { id: 's1r5', description: 'Supporting PWPS No.', value: getValue('supporting_pwps_no') },
        { id: 's1r6', description: 'Date of Issue', value: getValue('date_of_issue', 'date_qualified'), type: 'date' as const },
        { id: 's1r7', description: 'Welding Process(es)', value: getValue('welding_processes') },
        { id: 's1r8', description: 'Date of Welding', value: getValue('date_of_welding'), type: 'date' as const },
        { id: 's1r9', description: 'Type', value: getValue('type') },
        { id: 's1r10', description: 'Code Reference', value: getValue('code_reference') },
        { id: 's1r11', description: 'BI #', value: getValue('bi') },
        { id: 's1r12', description: 'Contract #', value: getValue('contract') },
        { id: 's1r13', description: 'Client/End User', value: getValue('client_end_user', 'approved_by') },
        { id: 's1r14', description: 'Date of Testing', value: getValue('date_of_testing'), type: 'date' as const }
      ]
      
      return { columns, data: rows }
    }

    // Transform welder testing info with proper field mapping
    const transformWelderTestingInfo = (pqr: PQR) => {
      const columns = [
        { 
          id: 'label', 
          header: 'Parameter',
          accessorKey: 'label',
          type: 'label' as const
        },
        { 
          id: 'value', 
          header: 'Details',
          accessorKey: 'value',
          type: 'input' as const
        }
      ]
      
      // Get welder info from welder_card_info if available
      const welderInfo = pqr.welder_card_info?.welder_info
      const welderName = welderInfo?.operator_name || ''
      const welderId = welderInfo?.operator_id || ''
      
      const rows = [
        { id: 'wti1', label: 'Welder Name', value: welderName },
        { id: 'wti2', label: 'Welder ID', value: welderId },
        { id: 'wti3', label: 'Welder Card ID', value: pqr.welder_card_id || '', hidden: true },
        { id: 'wti4', label: 'Mechanical Testing Conducted by', value: pqr.mechanical_testing_conducted_by || '' },
        { id: 'wti5', label: 'Lab Test No.', value: pqr.lab_test_no || '' }
      ]
      
      return { columns, data: rows }
    }

    // Transform certification info
    const transformCertification = (pqr: PQR) => {
      return { 
        columns: [], 
        data: [{ 
          id: 'cert-ref', 
          reference: pqr.law_name || pqr.type || '' 
        }] 
      }
    }

    // Transform joints with design photo URL
    const transformJoints = (pqr: PQR) => {
      const basicJointsData = transformToDynamicData(pqr.joints || {})
      
      // Get the backend URL for media files
      const getMediaUrl = (relativePath?: string): string | undefined => {
        if (!relativePath) return undefined
        
        // If it's already a full URL, return as is
        if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
          return relativePath
        }
        
        // Get the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
        
        // Replace backslashes with forward slashes and ensure proper path construction
        const cleanPath = relativePath.replace(/\\/g, '/')
        const separator = cleanPath.startsWith('/') ? '' : '/'
        
        return `${backendUrl}${separator}${cleanPath}`
      }
      
      // Return joint data with image URL - use undefined if no data so section uses defaults
      if (!basicJointsData) {
        return {
          designPhotoUrl: getMediaUrl(pqr.joint_design_sketch?.[0]) || '',
          designFiles: []
        }
      }
      
      return {
        ...basicJointsData,
        designPhotoUrl: getMediaUrl(pqr.joint_design_sketch?.[0]) || '',
        designFiles: []
      }
    }

    return {
      headerInfo: transformBasicInfo(pqr.basic_info, pqr),
      joints: transformJoints(pqr),
      baseMetals: transformToDynamicData(pqr.base_metals || {}),
      fillerMetals: transformToDynamicData(pqr.filler_metals || {}),
      positions: transformToDynamicData(pqr.positions || {}),
      preheat: transformToDynamicData(pqr.preheat || {}),
      pwht: transformToDynamicData(pqr.post_weld_heat_treatment || {}),
      gas: transformToDynamicData(pqr.gas || {}),
      electrical: transformToDynamicData(pqr.electrical_characteristics || {}),
      techniques: transformToDynamicData(pqr.techniques || {}),
      weldingParameters: transformToDynamicData(pqr.welding_parameters || {}),
      tensileTest: transformToDynamicData(pqr.tensile_test || {}),
      guidedBendTest: transformToDynamicData(pqr.guided_bend_test || {}),
      toughnessTest: transformToDynamicData(pqr.toughness_test || {}),
      filletWeldTest: transformToDynamicData(pqr.fillet_weld_test || {}),
      otherTests: transformToDynamicData(pqr.other_tests || {}),
      welderTestingInfo: transformWelderTestingInfo(pqr),
      signatures: transformToDynamicData(pqr.signatures || {}),
      certification: transformCertification(pqr)
    }
  }

  function extractHeaderValue(formData: PQRFormData, key: string): string {
    const rows = formData.headerInfo?.data ?? []
    const row = rows.find(r => {
      const desc = r.description
      return typeof desc === "string" && desc.toLowerCase() === key.toLowerCase()
    })
    const value = row?.value
    return typeof value === "string" ? value.trim() : value !== undefined ? String(value) : ""
  }

  const handleSubmit = (data: PQRFormData) => {
    // The form submission is handled by the PQRForm component
    // This function is called after successful update
    toast.success("PQR updated successfully")
    router.push(ROUTES.APP.WELDERS.PQR.ROOT)
  }

  // Handle loading and error states
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading PQR data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error loading PQR: {error.message}</div>
  }

  if (!pqrData) {
    return <div className="flex items-center justify-center p-8">PQR not found</div>
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit PQR" description="Update the PQR details" label={null} href={ROUTES.APP.WELDERS.PQR.ROOT}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Form Type</span>
          <Select value={formType} onValueChange={(v: "asme" | "api") => setFormType(v)} disabled>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Select form type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asme">ASME SEC IX</SelectItem>
              <SelectItem value="api">API 1104</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormHeader>
      
      <div>
        <PQRForm 
          key={`pqr-edit-${id}-${Object.keys(initialFormData).length > 0 ? 'loaded' : 'empty'}`}
          isAsme={isAsme} 
          initialPqrData={initialFormData}
          pqrId={id}
          onSubmit={handleSubmit} 
        />
      </div>
    </div>
  )
}
