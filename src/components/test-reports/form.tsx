"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PlusIcon, TrashIcon } from "lucide-react"
// Define types locally for now
interface TestReport {
  id: string
  reportNo: string
  preparationId: string
  selectedRequest?: any // The selected request object
  certificate: CertificateDetails
  items: ReportItem[]
}

interface CertificateDetails {
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  gripco_ref_no: string
  revision_no: string
  client_name: string
  customer_name_no: string
  atten: string
  customer_po: string
  project_name: string
  name_of_laboratory: string
  address: string
  tested_by: string
  reviewed_by: string
}

interface ReportItem {
  id: string
  preparationItemId: string
  specimenId: string
  specimenOid: string // Store the specimen OID for API calls
  testMethodId: string
  testMethodName: string
  testEquipment: string
  testEquipmentId: string
  samplePrepMethod: string
  sampleDescription: string
  materialGrade: string
  heatNo: string
  temperature: string
  humidity: string
  comments: string
  columns: any[]
  data: any[]
  hasImage?: boolean
  images: Array<{
    image_url: string
    caption: string
    file?: File
  }>
}

const generateReportNo = () => `RPT-${Date.now()}`
import { testMethodService } from "@/services/test-methods.service"
import { listSampleReceivings } from "@/lib/sample-receiving"
import { generateStableId } from "@/utils/hydration-fix"
import { useCreateCertificate } from "@/hooks/use-certificates"
import { useCreateCertificateItem, useUploadCertificateItemImage } from "@/hooks/use-certificate-items"
// Remove unused import
import { type CreateCertificateData } from "@/services/certificates.service"
import { type CreateCertificateItemData } from "@/services/certificate-items.service"
import { toast } from "sonner"
// Define CompleteCertificate locally for now
interface CompleteCertificate {
  request_id: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  gripco_ref_no: string
  revision_no: string
  client_name: string
  customer_name_no: string
  atten: string
  customer_po: string
  project_name: string
  name_of_laboratory: string
  address: string
  tested_by: string
  reviewed_by: string
  certificate_items_json: any[]
}
import { DynamicTable, type DynamicColumn, type DynamicRow } from "@/components/pqr/form/dynamic-table"
import { RequestSelector } from "@/components/common/request-selector"

export interface TestReportFormData extends Omit<TestReport, "id" | "createdAt" | "updatedAt"> {}

interface Props {
  initialData?: Partial<TestReportFormData>
  onSubmit: (data: TestReportFormData) => void
  readOnly?: boolean
}

function fallbackColumns(): DynamicColumn[] {
  return [
    { id: "col-0", header: "Test Data", accessorKey: "col-0", type: "input" },
    { id: "col-1", header: "Result", accessorKey: "col-1", type: "input" },
    { id: "col-2", header: "Remarks", accessorKey: "col-2", type: "textarea" },
  ]
}

function genLocalId(): string { 
  return generateStableId('loc')
}

// Helper function to map test results back to form structure
function mapTestResultsToFormData(testResults: { columns: string[], data: any[][] }, columns: DynamicColumn[]): DynamicRow[] {
  return testResults.data.map((rowData, rowIndex) => {
    const row: DynamicRow = {
      id: `row-${rowIndex + 1}`,
      label: rowData[0] || `Specimen ${rowIndex + 1}`, // First column as label
    }
    
    // Map each column value
    columns.forEach((column, colIndex) => {
      row[column.accessorKey] = rowData[colIndex] || ""
    })
    
    return row
  })
}

export function TestReportForm({ initialData, onSubmit, readOnly = false }: Props) {
  const [preparationId, setPreparationId] = useState(initialData?.preparationId ?? "")
  const [selectedRequest, setSelectedRequest] = useState<any>(initialData?.selectedRequest ?? null)
  const [certificate, setCertificate] = useState<CertificateDetails>(initialData?.certificate ?? {
    date_of_sampling: "", date_of_testing: "", issue_date: "", gripco_ref_no: "", revision_no: "",
    client_name: "", customer_name_no: "", atten: "", customer_po: "",
    project_name: "", name_of_laboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM", 
    address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia", tested_by: "", reviewed_by: "",
  })
  const [items, setItems] = useState<ReportItem[]>(initialData?.items ?? [])

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {      
      if (initialData.preparationId !== undefined) {
        setPreparationId(initialData.preparationId)
      }
      
      if (initialData.selectedRequest !== undefined) {
        setSelectedRequest(initialData.selectedRequest)
      }
      
      if (initialData.certificate) {
        setCertificate(initialData.certificate)
      }
      
      if (initialData.items) {
        setItems(initialData.items)
      }
    }
  }, [initialData])

  // Certificate creation hooks
  const createCertificateMutation = useCreateCertificate()
  const createCertificateItemMutation = useCreateCertificateItem()
  const uploadImageMutation = useUploadCertificateItemImage()

  const recMap = useMemo(() => new Map(listSampleReceivings().map(r => [r.id, r])), [])

  // Load detailed preparation data when a request is selected
  useEffect(() => {
    if (!selectedRequest) return
    
    const loadDetailedPreparationData = async () => {
      try {
        // Map the sample preparation data to certificate fields
        const firstSampleLot = selectedRequest.sample_lots?.[0]
        
        const newCertificate = {
          date_of_sampling: certificate.date_of_sampling,
          date_of_testing: certificate.date_of_testing,
          issue_date: certificate.issue_date,
          gripco_ref_no: firstSampleLot?.job_id || "", // Map job_id to gripco_ref_no
          revision_no: certificate.revision_no,
          client_name: firstSampleLot?.client_name || "", // Map client_name
          customer_name_no: certificate.customer_name_no,
          atten: certificate.atten,
          customer_po: certificate.customer_po,
          project_name: firstSampleLot?.project_name || "", // Map project_name
          name_of_laboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
          address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
          tested_by: certificate.tested_by,
          reviewed_by: certificate.reviewed_by,
        }
        
        setCertificate(newCertificate)
        
        // Seed items based on the sample lots data
        if (selectedRequest.sample_lots && selectedRequest.sample_lots.length > 0) {
          const seeded: ReportItem[] = selectedRequest.sample_lots.map((sampleLot: any, index: number) => {
            // Create dynamic columns based on test_method.test_columns (will be fetched later)
            const dynamicColumns: DynamicColumn[] = fallbackColumns() // Default columns, will be updated when test method details are fetched
            
            // Create initial data rows based on specimens
            const initialData: DynamicRow[] = sampleLot.specimens?.map((specimen: any, specIndex: number) => ({
              id: `row-${specIndex + 1}`,
              label: specimen.specimen_id || `Specimen ${specIndex + 1}`,
              specimen_oid: specimen.specimen_oid || specimen.id, // Store the OID for API calls
              ...dynamicColumns.reduce((acc, col) => {
                acc[col.accessorKey] = "" // Empty values for input columns
                return acc
              }, {} as any)
            })) || [{ id: "row-1", label: "" } as DynamicRow]
            
             return {
               id: genLocalId(),
               preparationItemId: sampleLot.sample_lot_id || "",
               specimenId: sampleLot.specimens?.[0]?.specimen_id || "",
               specimenOid: sampleLot.specimens?.[0]?.specimen_oid || sampleLot.specimens?.[0]?.id || "",
               testMethodId: sampleLot.test_method?.test_method_oid || "",
               testMethodName: sampleLot.test_method?.test_name || "",
               testEquipment: "",
               testEquipmentId: "",
               samplePrepMethod: "",
               sampleDescription: sampleLot.item_description || "",
               materialGrade: "",
               heatNo: "",
               temperature: "",
               humidity: "",
               comments: sampleLot.remarks || "",
               columns: dynamicColumns,
               data: initialData,
               hasImage: false, // Will be updated when test method details are fetched
               images: [],
             }
          })
          setItems(seeded)
        }
      } catch (error) {
        console.error("Failed to load detailed preparation data:", error)
      }
    }
    
    loadDetailedPreparationData()
  }, [selectedRequest])

  // Fetch test method details for each item
  useEffect(() => {
    if (!items.length) return
    
    // Check if any item needs test method details
    const needsFetch = items.some(item => 
      item.testMethodId && 
      (!item.columns || item.columns.length === 0 || item.columns[0].header === "Test Data")
    )
    
    if (!needsFetch) return

    const fetchTestMethodDetails = async () => {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          // Skip if already has proper columns
          if (item.columns && item.columns.length > 0 && item.columns[0].header !== "Test Data") {
            return item
          }
          
          if (item.testMethodId) {
            try {
              // Use the test method service directly instead of the hook
              const testMethodDetails = await testMethodService.getById(item.testMethodId)
              
              if (testMethodDetails && testMethodDetails.test_columns) {
                // Create dynamic columns based on test_method_details.test_columns
                const dynamicColumns: DynamicColumn[] = testMethodDetails.test_columns.map((columnName: string, colIndex: number) => ({
                  id: `col-${colIndex}`,
                  header: columnName,
                  accessorKey: `col-${colIndex}`,
                  type: "input" // All columns as input fields
                }))
                
                // Update existing data rows to include new columns
                const updatedData = item.data.map((row) => {
                  const newRow = { ...row }
                  // Initialize new columns with empty values
                  dynamicColumns.forEach((col) => {
                    if (!(col.accessorKey in newRow)) {
                      newRow[col.accessorKey] = ""
                    }
                  })
                  return newRow
                })
                
                 return {
                   ...item,
                   columns: dynamicColumns,
                   data: updatedData,
                   testMethodName: testMethodDetails.test_name,
                   comments: testMethodDetails.comments || item.comments,
                   hasImage: testMethodDetails.hasImage || false,
                 }
              }
            } catch (error) {
              console.error(`Failed to fetch test method details for ${item.testMethodId}:`, error)
            }
          }
          return item
        })
      )
      
      setItems(updatedItems)
    }

    fetchTestMethodDetails()
  }, [items]) // Run when items change

  const updateCertificate = <K extends keyof CertificateDetails>(key: K, value: CertificateDetails[K]) => setCertificate(prev => ({ ...prev, [key]: value }))
  const updateItem = useCallback((id: string, payload: Partial<ReportItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...payload } : i))
  }, [])
  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), [])

  const addSectionFor = useCallback((base: ReportItem) => {
    if (!selectedRequest) return
    // For now, we'll create a simple clone - this can be enhanced based on your requirements
    const clone: ReportItem = {
      id: genLocalId(),
      preparationItemId: base.preparationItemId,
      specimenId: "",
      specimenOid: "",
      testMethodId: base.testMethodId,
      testMethodName: base.testMethodName,
      testEquipment: "",
      testEquipmentId: "",
      samplePrepMethod: "",
      sampleDescription: "",
      materialGrade: "",
      heatNo: "",
      temperature: "",
      humidity: "",
      comments: "",
      columns: Array.isArray(base.columns) && base.columns.length ? base.columns : fallbackColumns(),
      data: Array.isArray(base.data) && base.data.length ? base.data : [{ id: "row-1", label: "" } as DynamicRow],
      hasImage: base.hasImage || false,
      images: [],
    }
    setItems(prev => [...prev, clone])
  }, [items, selectedRequest])

  // Image upload handlers
  const handleImageUpload = useCallback(async (itemId: string, files: FileList) => {
    const item = items.find(i => i.id === itemId)
    if (!item || !item.specimenOid) {
      toast.error("Please select a specimen ID before uploading images")
      return
    }

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const uploadPromises = validFiles.map(async (file) => {
      try {
        const response = await uploadImageMutation.mutateAsync({
          image: file,
          specimen_id: item.specimenOid
        })
        
        return {
          image_url: response.data.image_url,
          caption: "", // User can add caption later
          file: file
        }
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return null
      }
    })

    const uploadedImages = (await Promise.all(uploadPromises)).filter((img): img is NonNullable<typeof img> => img !== null)
    
    if (uploadedImages.length > 0) {
      updateItem(itemId, {
        images: [...item.images, ...uploadedImages]
      })
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`)
    }
  }, [items, uploadImageMutation])

  const handleImageCaptionChange = useCallback((itemId: string, imageIndex: number, caption: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const updatedImages = [...item.images]
    updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption }
    
    updateItem(itemId, { images: updatedImages })
  }, [items, updateItem])

  const handleRemoveImage = useCallback((itemId: string, imageIndex: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const updatedImages = item.images.filter((_, index) => index !== imageIndex)
    updateItem(itemId, { images: updatedImages })
  }, [items, updateItem])

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preparationId || !selectedRequest) return

    try {
      // Step 1: Create certificate
      const certificateData: CreateCertificateData = {
        request_id: selectedRequest.id || "",
        date_of_sampling: certificate.date_of_sampling,
        date_of_testing: certificate.date_of_testing,
        issue_date: certificate.issue_date,
        revision_no: certificate.revision_no,
        customers_name_no: certificate.customer_name_no,
        atten: certificate.atten,
        customer_po: certificate.customer_po,
        tested_by: certificate.tested_by,
        reviewed_by: certificate.reviewed_by,
      }

      const certificateResponse = await createCertificateMutation.mutateAsync(certificateData)
      const certificateId = certificateResponse.data.id
      toast.success("Certificate created successfully")

      // Step 2: Create certificate items for each test item
      for (const item of items) {
        // Transform test results table data to include column names and data
        const columnNames = item.columns.map(col => col.header)
        const testResultsData: any[][] = []
        
        // Process each row in the dynamic table
        item.data.forEach((row, rowIndex) => {
          const rowData: any[] = []
          // Process each column in the row
          item.columns.forEach((column, colIndex) => {
            const value = row[column.accessorKey] || ""
            rowData[colIndex] = value
          })
          testResultsData[rowIndex] = rowData
        })
        
        const testResults = {
          columns: columnNames,
          data: testResultsData
        }

         const certificateItemData: CreateCertificateItemData = {
           certificate_id: certificateId,
           sample_preparation_method: item.samplePrepMethod,
           material_grade: item.materialGrade,
           temperature: item.temperature,
           humidity: item.humidity,
           po: certificate.customer_po,
           mtc_no: "", // This would need to be added to the form if required
           heat_no: item.heatNo,
           comments: item.comments,
           specimen_sections: [{
             specimen_id: item.specimenOid, // Use the OID instead of the name
             test_results: JSON.stringify(testResults), // Convert to JSON string
             equipment_name: item.testEquipment,
             equipment_calibration: "Calibrated on " + new Date().toISOString().split('T')[0], // Default calibration date
             images_list: item.images.map(img => ({
               image_url: img.image_url,
               caption: img.caption
             }))
           }]
         }

        await createCertificateItemMutation.mutateAsync(certificateItemData)
      }
      
      toast.success(`Certificate and ${items.length} certificate items created successfully`)
      
      // Call the original onSubmit for local storage (if needed)
      onSubmit({ 
        reportNo: generateReportNo(), // Generate report number automatically
        preparationId, 
        certificate, 
        items 
      })
      
    } catch (error) {
      console.error('Failed to create certificate:', error)
      toast.error("Failed to create certificate. Please try again.")
    }
  }

  return (
    <form onSubmit={onFormSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Select Request</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Preparation / Request #</Label>
            <RequestSelector
              value={selectedRequest?.id || ""}
              onValueChange={(requestId, request) => {
                setPreparationId(requestId || "")
                setSelectedRequest(request)
              }}
              placeholder="Select a request..."
              disabled={readOnly}
              selectedRequest={selectedRequest}
            />
          </div>
        </CardContent>
      </Card>

      {selectedRequest && (
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {([
              ["date_of_sampling", "Date of Sampling", "date", false],
              ["date_of_testing", "Date of Testing", "date", false],
              ["issue_date", "Issue Date", "date", false],
              ["gripco_ref_no", "Gripco Ref No", "text", true], // Disabled - mapped from job_id
              ["revision_no", "Revision No", "text", false],
              ["client_name", "Client Name", "text", true], // Disabled - mapped from client_name
              ["customer_name_no", "Customer's Name & no.", "text", false],
              ["atten", "Atten", "text", false],
              ["customer_po", "Customer PO", "text", false],
              ["project_name", "Project Name", "text", true], // Disabled - mapped from project_name
              ["name_of_laboratory", "Name of Laboratory", "text", true],
              ["address", "Address", "text", true],
            ] as const).map(([key, label, type, isDisabled]) => (
              <div key={key} className="grid gap-2">
                <Label>{label}</Label>
                {type === "date" ? (
                  <Input 
                    type="date" 
                    value={certificate[key as keyof CertificateDetails]} 
                    onChange={(e) => updateCertificate(key as keyof CertificateDetails, e.target.value)} 
                    disabled={readOnly || isDisabled}
                    className={isDisabled ? "bg-muted/50" : ""}
                  />
                ) : (
                  <Input 
                    value={certificate[key as keyof CertificateDetails]} 
                    onChange={(e) => updateCertificate(key as keyof CertificateDetails, e.target.value)} 
                    disabled={readOnly || isDisabled}
                    className={isDisabled ? "bg-muted/50" : ""}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedRequest && (
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {items.map((it) => {
              const cols: DynamicColumn[] = Array.isArray(it.columns) && it.columns.length > 0 ? it.columns : fallbackColumns()
              const rows: DynamicRow[] = Array.isArray(it.data) && it.data.length > 0 ? it.data : [{ id: "row-1" } as DynamicRow]
              return (
                <Card key={it.id} className="border-muted/50">
                  <CardHeader className="px-2">
                    <CardTitle className="text-lg">{it.testMethodName}</CardTitle>
                    <div className="grid gap-1 mt-2">
                      <Label>Select Specimen ID</Label>
                      <Select value={it.specimenId} onValueChange={(value) => {
                        const selectedRow = it.data?.find(row => row.label === value)
                        updateItem(it.id, { 
                          specimenId: value,
                          specimenOid: selectedRow?.specimen_oid || ""
                        })
                      }} disabled={readOnly}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select specimen" />
                        </SelectTrigger>
                        <SelectContent>
                          {it.data?.map((row, index) => (
                            <SelectItem key={row.id} value={row.label || `Specimen ${index + 1}`}>
                              {row.label || `Specimen ${index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    {/* Test Attributes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="grid gap-1">
                        <Label>Test Equipment</Label>
                        <Input 
                          value={it.testEquipment} 
                          onChange={(e) => updateItem(it.id, { testEquipment: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter test equipment"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Sample Prep Method</Label>
                        <Input 
                          value={it.samplePrepMethod} 
                          onChange={(e) => updateItem(it.id, { samplePrepMethod: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter sample prep method"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Sample Description</Label>
                        <Input 
                          value={it.sampleDescription} 
                          onChange={(e) => updateItem(it.id, { sampleDescription: e.target.value })} 
                          disabled={true} // Always disabled - mapped from sample preparation
                          placeholder="Sample description from preparation"
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Material Grade</Label>
                        <Input 
                          value={it.materialGrade} 
                          onChange={(e) => updateItem(it.id, { materialGrade: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter material grade"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Heat No.</Label>
                        <Input 
                          value={it.heatNo} 
                          onChange={(e) => updateItem(it.id, { heatNo: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter heat number"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Temperature</Label>
                        <Input 
                          value={it.temperature} 
                          onChange={(e) => updateItem(it.id, { temperature: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter temperature"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Humidity</Label>
                        <Input 
                          value={it.humidity} 
                          onChange={(e) => updateItem(it.id, { humidity: e.target.value })} 
                          disabled={readOnly}
                          placeholder="Enter humidity"
                        />
                      </div>
                    </div>
                    
                    <DynamicTable
                      key={`${it.id}-${it.columns.length}-${it.testMethodId}`}
                      initialColumns={cols}
                      initialData={rows}
                      onColumnsChange={(newCols) => updateItem(it.id, { columns: (newCols as DynamicColumn[]) ?? [] })}
                      onDataChange={(newRows) => updateItem(it.id, { data: (newRows as DynamicRow[]) ?? [] })}
                    />
                    
                     {/* Comments Section */}
                     <div className="mt-4">
                       <Label htmlFor={`comments-${it.id}`}>Comments</Label>
                       <Textarea
                         id={`comments-${it.id}`}
                         value={it.comments}
                         onChange={(e) => updateItem(it.id, { comments: e.target.value })}
                         disabled={readOnly}
                         placeholder="Enter test comments..."
                         className="mt-1"
                         rows={3}
                       />
                     </div>

                     {/* Image Upload Section - Only show if test method has images */}
                     {it.hasImage && (
                       <div className="mt-4">
                         <Label>Test Images</Label>
                         <div className="mt-2 space-y-4">
                           {/* File Upload */}
                           {!readOnly && (
                             <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                               <input
                                 type="file"
                                 multiple
                                 accept="image/*"
                                 onChange={(e) => {
                                   if (e.target.files && e.target.files.length > 0) {
                                     handleImageUpload(it.id, e.target.files)
                                   }
                                 }}
                                 className="hidden"
                                 id={`image-upload-${it.id}`}
                               />
                               <label
                                 htmlFor={`image-upload-${it.id}`}
                                 className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                               >
                                 <div className="text-muted-foreground">
                                   <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                   </svg>
                                 </div>
                                 <span className="text-sm text-muted-foreground">
                                   Click to upload images or drag and drop
                                 </span>
                                 <span className="text-xs text-muted-foreground">
                                   PNG, JPG, GIF up to 10MB each
                                 </span>
                               </label>
                             </div>
                           )}

                           {/* Uploaded Images */}
                           {it.images.length > 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {it.images.map((image, imageIndex) => (
                                 <div key={imageIndex} className="border rounded-lg p-3 space-y-2">
                                   <div className="aspect-video bg-muted rounded-md overflow-hidden">
                                     <img
                                       src={image.image_url}
                                       alt={`Test image ${imageIndex + 1}`}
                                       className="w-full h-full object-cover"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <Input
                                       placeholder="Image caption..."
                                       value={image.caption}
                                       onChange={(e) => handleImageCaptionChange(it.id, imageIndex, e.target.value)}
                                       disabled={readOnly}
                                       className="text-sm"
                                     />
                                     {!readOnly && (
                                       <Button
                                         type="button"
                                         variant="destructive"
                                         size="sm"
                                         onClick={() => handleRemoveImage(it.id, imageIndex)}
                                         className="w-full"
                                       >
                                         Remove Image
                                       </Button>
                                     )}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                    
                    <div className="flex justify-between mt-2">
                      {!readOnly && (
                        <Button type="button" variant="outline" size="sm" onClick={() => addSectionFor(it)}><PlusIcon className="w-4 h-4 mr-1" />Add Section</Button>
                      )}
                      {!readOnly && (
                        <ConfirmPopover title="Remove this result?" confirmText="Remove" onConfirm={() => removeItem(it.id)} trigger={<Button type="button" variant="ghost" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      {selectedRequest && (
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Testing Personnel</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tested By</Label>
              <Input 
                value={certificate.tested_by} 
                onChange={(e) => updateCertificate("tested_by", e.target.value)} 
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Reviewed By</Label>
              <Input 
                value={certificate.reviewed_by} 
                onChange={(e) => updateCertificate("reviewed_by", e.target.value)} 
                disabled={readOnly}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!readOnly && selectedRequest && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initialData ? "Update Report" : "Save Report"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


