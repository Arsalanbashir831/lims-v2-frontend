"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrashIcon } from "lucide-react"
import { RequestSelector } from "@/components/common/request-selector"
import { DynamicTable, type DynamicColumn, type DynamicRow } from "@/components/pqr/form/dynamic-table"
import { useCreateTestReport, useCreateTestReportItem, useUpdateTestReport, useUpdateTestReportItem, useUploadTestReportImage } from "@/hooks/use-test-reports"
import { testMethodService } from "@/services/test-methods.service"
import { toast } from "sonner"

// Types
interface TestReportFormData {
  // Certificate Details
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
  
  // Request Info
  selectedRequest?: {
    id: string;
    request_no: string;
    sample_lots: Array<{
      item_description: string;
      planned_test_date: string | null;
      dimension_spec: string | null;
      request_by: string | null;
      remarks: string | null;
      sample_lot_id: string;
      test_method: {
        test_method_oid: string;
        test_name: string;
      };
      job_id: string;
      item_no: string;
      client_name: string | null;
      project_name: string | null;
      specimens: Array<{
        specimen_oid: string;
        specimen_id: string;
      }>;
      specimens_count: number;
    }>;
    sample_lots_count: number;
    specimens: Array<{
      specimen_oid: string;
      specimen_id: string;
    }>;
    created_at: string;
    updated_at: string;
  } | null
  
  // Test Items
  items: TestReportItem[]
}

interface TestReportItem {
  id: string
  specimenId: string
  specimenOid: string
  testMethodId: string
  testMethodName: string
  testEquipment: string
  samplePrepMethod: string
  sampleDescription: string
  materialGrade: string
  heatNo: string
  temperature: string
  humidity: string
  comments: string
  columns: DynamicColumn[]
  data: DynamicRow[]
  hasImage: boolean
  images: Array<{
    image_url: string
    caption: string
    file?: File
    isTemporary?: boolean
  }>
}

interface Props {
  initialData?: Partial<TestReportFormData>
  onSubmit?: (data: TestReportFormData) => void
  readOnly?: boolean
  isEditing?: boolean
  certificateId?: string
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Helper function to get full image URL
function getFullImageUrl(imageUrl: string): string {
  // If it's already a full URL (starts with http/https) or blob URL, return as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }
  
  // If it's a relative path, prepend the backend URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.2:8000"
  return `${backendUrl}${imageUrl}`
}

function createDefaultColumns(): DynamicColumn[] {
  return [
    { id: "col-0", header: "Test Data", accessorKey: "col-0", type: "input" },
    { id: "col-1", header: "Result", accessorKey: "col-1", type: "input" },
    { id: "col-2", header: "Remarks", accessorKey: "col-2", type: "input" },
  ]
}

function createDefaultRow(): DynamicRow {
  return { id: "row-1", label: "Row 1", "col-0": "", "col-1": "", "col-2": "" }
}

export function TestReportForm({ initialData, onSubmit, readOnly = false, isEditing = false, certificateId }: Props) {
  // Form State
  const [formData, setFormData] = useState<TestReportFormData>({
    date_of_sampling: "",
    date_of_testing: "",
    issue_date: "",
    revision_no: "",
    customers_name_no: "",
    atten: "",
    customer_po: "",
    tested_by: "",
    reviewed_by: "",
    selectedRequest: null,
    items: [],
    ...initialData
  })

  // Mutations
  const createTestReportMutation = useCreateTestReport()
  const createTestReportItemMutation = useCreateTestReportItem()
  const updateTestReportMutation = useUpdateTestReport()
  const updateTestReportItemMutation = useUpdateTestReportItem()
  const uploadImageMutation = useUploadTestReportImage()

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Cleanup temporary URLs on unmount
  useEffect(() => {
    return () => {
      formData.items.forEach(item => {
        item.images.forEach(image => {
          if (image.isTemporary && image.image_url.startsWith('blob:')) {
            URL.revokeObjectURL(image.image_url)
          }
        })
      })
    }
  }, [])

  // Debug logging for hasImage property
  useEffect(() => {
    formData.items.forEach(item => {
      console.log(`Item ${item.id} (${item.testMethodName}): hasImage = ${item.hasImage}`)
    })
  }, [formData.items])

  // Handle request selection
  const handleRequestSelect = async (requestId: string | undefined, request: {
    id: string;
    request_no: string;
    sample_lots: Array<{
      item_description: string;
      planned_test_date: string | null;
      dimension_spec: string | null;
      request_by: string | null;
      remarks: string | null;
      sample_lot_id: string;
      test_method: {
        test_method_oid: string;
        test_name: string;
      };
      job_id: string;
      item_no: string;
      client_name: string | null;
      project_name: string | null;
      specimens: Array<{
        specimen_oid: string;
        specimen_id: string;
      }>;
      specimens_count: number;
    }>;
    sample_lots_count: number;
    created_at: string;
    updated_at: string;
  } | undefined) => {
    if (!request) {
      setFormData(prev => ({ ...prev, selectedRequest: null, items: [] }))
      return
    }
    
    // Map request data to certificate fields
    const firstSampleLot = request.sample_lots?.[0]
    
    // Create test items from sample lots
    const items: TestReportItem[] = []
    
    if (request.sample_lots) {
      for (const sampleLot of request.sample_lots) {
        // Get test method details
        let testMethodDetails = null
        let columns = createDefaultColumns()
        let hasImage = false
        
        try {
          if (sampleLot.test_method?.test_method_oid) {
            testMethodDetails = await testMethodService.getById(sampleLot.test_method.test_method_oid)
            
            if (testMethodDetails?.test_columns) {
              columns = testMethodDetails.test_columns.map((colName: string, idx: number) => ({
                id: `col-${idx}`,
                header: colName,
                accessorKey: `col-${idx}`,
                type: "input"
              }))
            }
            
            hasImage = testMethodDetails?.hasImage || false
          }
        } catch (error) {
          console.error("Failed to fetch test method details:", error)
        }

        // Create data rows for each specimen
        const dataRows: DynamicRow[] = sampleLot.specimens?.map((specimen: { specimen_oid: string; specimen_id: string }, idx: number) => {
          const specimenLabel = specimen.specimen_id?.trim() || `Specimen ${idx + 1}`
          const row: DynamicRow = {
            id: `row-${idx + 1}`,
            label: specimenLabel,
            specimen_oid: specimen.specimen_oid || ""
          }
          
          // Initialize column values
          columns.forEach(col => {
            row[col.accessorKey] = ""
          })
          
          return row
        }).filter((row: DynamicRow) => row.label && String(row.label).trim() !== "") || [createDefaultRow()]

        items.push({
          id: generateId(),
          specimenId: sampleLot.specimens?.[0]?.specimen_id || "",
          specimenOid: sampleLot.specimens?.[0]?.specimen_oid || "",
          testMethodId: sampleLot.test_method?.test_method_oid || "",
          testMethodName: sampleLot.test_method?.test_name || "",
          testEquipment: "",
          samplePrepMethod: "",
          sampleDescription: sampleLot.item_description || "",
          materialGrade: "",
          heatNo: "",
          temperature: "",
          humidity: "",
          comments: sampleLot.remarks || "",
          columns,
          data: dataRows,
          hasImage,
          images: []
        })
      }
    }

    setFormData(prev => ({
      ...prev,
      selectedRequest: {
        ...request,
        specimens: request.sample_lots.flatMap(lot => lot.specimens)
      },
      customers_name_no: prev.customers_name_no || "",
      customer_po: prev.customer_po || "",
      items
    }))
  }

  // Update form field
  const updateField = (field: keyof TestReportFormData, value: string | TestReportFormData['selectedRequest'] | TestReportItem[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Update test item
  const updateItem = (itemId: string, updates: Partial<TestReportItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }))
  }

  // Remove test item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  // Add test item
  const addItem = () => {
    if (!formData.selectedRequest) return

    const newItem: TestReportItem = {
      id: generateId(),
      specimenId: "",
      specimenOid: "",
      testMethodId: "",
      testMethodName: "",
      testEquipment: "",
      samplePrepMethod: "",
      sampleDescription: "",
      materialGrade: "",
      heatNo: "",
      temperature: "",
      humidity: "",
      comments: "",
      columns: createDefaultColumns(),
      data: [createDefaultRow()],
      hasImage: false,
      images: []
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  // Handle image upload - Only add to UI, defer API calls to form submission
  const handleImageUpload = (itemId: string, files: FileList) => {
    const item = formData.items.find(i => i.id === itemId)
    if (!item || !item.specimenOid) {
      toast.error("Please select a specimen before uploading images")
      return
    }

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
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

    // Add images to UI state with temporary URLs for preview
    const newImages = validFiles.map(file => ({
      image_url: URL.createObjectURL(file), // Temporary URL for preview
      caption: "",
      file: file, // Store file for later upload
      isTemporary: true // Flag to identify images that need uploading
    }))

    updateItem(itemId, {
      images: [...item.images, ...newImages]
    })

    toast.success(`${newImages.length} image(s) added. They will be uploaded when you save the form.`)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.selectedRequest) {
      toast.error("Please select a request")
      return
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one test item")
      return
    }

    try {
      let currentCertificateId = certificateId

      // Step 1: Upload all temporary images first
      const itemsWithUploadedImages = await Promise.all(
        formData.items.map(async (item) => {
          const uploadedImages = []
          
          for (const image of item.images) {
            if (image.isTemporary && image.file) {
              // Upload new image
              try {
                const uploadResponse = await uploadImageMutation.mutateAsync({
                  image: image.file,
                  specimen_id: item.specimenOid
                })
                
                uploadedImages.push({
                  image_url: uploadResponse.data.image_url,
                  caption: image.caption
                })
              } catch (error) {
                console.error("Failed to upload image:", error)
                toast.error(`Failed to upload image for specimen ${item.specimenId}`)
                throw error
              }
            } else {
              // Keep existing image (already uploaded)
              uploadedImages.push({
                image_url: image.image_url,
                caption: image.caption
              })
            }
          }
          
          return {
            ...item,
            images: uploadedImages
          }
        })
      )

      if (isEditing && certificateId) {
        // Edit Mode: Update existing certificate
        const certificateUpdateData = {
          date_of_sampling: formData.date_of_sampling,
          date_of_testing: formData.date_of_testing,
          issue_date: formData.issue_date,
          revision_no: formData.revision_no,
          customers_name_no: formData.customers_name_no,
          atten: formData.atten,
          customer_po: formData.customer_po,
          tested_by: formData.tested_by,
          reviewed_by: formData.reviewed_by,
        }

        await updateTestReportMutation.mutateAsync({
          id: certificateId,
          data: certificateUpdateData
        })

        toast.success("Certificate updated successfully")

        // Update certificate items with uploaded images
        for (const item of itemsWithUploadedImages) {
          const testResults = {
            columns: item.columns.map(col => col.header),
            data: item.data.map(row => 
              item.columns.map(col => row[col.accessorKey] || "")
            )
          }

          const itemUpdateData = {
            sample_preparation_method: item.samplePrepMethod,
            material_grade: item.materialGrade,
            temperature: item.temperature,
            humidity: item.humidity,
            po: formData.customer_po,
            mtc_no: "",
            heat_no: item.heatNo,
            comments: item.comments,
            equipment_name: item.testEquipment,
            equipment_calibration: `Calibrated on ${new Date().toISOString().split('T')[0]}`,
            specimen_sections: [{
              specimen_id: item.specimenOid,
              test_results: JSON.stringify(testResults),
              images_list: item.images
            }]
          }

          await updateTestReportItemMutation.mutateAsync({
            id: item.id,
            data: itemUpdateData
          })
        }

        toast.success(`Certificate and ${itemsWithUploadedImages.length} items updated successfully`)
      } else {
        // Create Mode: Create new certificate
        const certificateData = {
          request_id: formData.selectedRequest.id,
          date_of_sampling: formData.date_of_sampling,
          date_of_testing: formData.date_of_testing,
          issue_date: formData.issue_date,
          revision_no: formData.revision_no,
          customers_name_no: formData.customers_name_no,
          atten: formData.atten,
          customer_po: formData.customer_po,
          tested_by: formData.tested_by,
          reviewed_by: formData.reviewed_by,
        }

        const certificateResponse = await createTestReportMutation.mutateAsync(certificateData)
        currentCertificateId = certificateResponse.data.id

        toast.success("Certificate created successfully")

        // Create certificate items with uploaded images
        for (const item of itemsWithUploadedImages) {
          const testResults = {
            columns: item.columns.map(col => col.header),
            data: item.data.map(row => 
              item.columns.map(col => row[col.accessorKey] || "")
            )
          }

          const itemData = {
            certificate_id: currentCertificateId,
            sample_preparation_method: item.samplePrepMethod,
            material_grade: item.materialGrade,
            temperature: item.temperature,
            humidity: item.humidity,
            po: formData.customer_po,
            mtc_no: "",
            heat_no: item.heatNo,
            comments: item.comments,
            equipment_name: item.testEquipment,
            equipment_calibration: `Calibrated on ${new Date().toISOString().split('T')[0]}`,
            specimen_sections: [{
              specimen_id: item.specimenOid,
              test_results: JSON.stringify(testResults),
              images_list: item.images
            }]
          }

          await createTestReportItemMutation.mutateAsync(itemData)
        }

        toast.success(`Certificate and ${itemsWithUploadedImages.length} items created successfully`)
      }
      
      if (onSubmit) {
        onSubmit(formData)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} test report:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} test report`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label>Preparation / Request #</Label>
            <RequestSelector
              value={formData.selectedRequest?.id || ""}
              onValueChange={(requestId, request) => handleRequestSelect(requestId, request as any)}
              placeholder="Select a request..."
              disabled={readOnly || isEditing}
              selectedRequest={formData.selectedRequest as any}
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      {formData.selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Date of Sampling</Label>
              <Input 
                type="date" 
                value={formData.date_of_sampling}
                onChange={(e) => updateField('date_of_sampling', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date of Testing</Label>
              <Input 
                type="date" 
                value={formData.date_of_testing}
                onChange={(e) => updateField('date_of_testing', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Issue Date</Label>
              <Input 
                type="date" 
                value={formData.issue_date}
                onChange={(e) => updateField('issue_date', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Revision No</Label>
              <Input 
                value={formData.revision_no}
                onChange={(e) => updateField('revision_no', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Customer Name & No</Label>
              <Input 
                value={formData.customers_name_no}
                onChange={(e) => updateField('customers_name_no', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Attention</Label>
              <Input 
                value={formData.atten}
                onChange={(e) => updateField('atten', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Customer PO</Label>
              <Input 
                value={formData.customer_po}
                onChange={(e) => updateField('customer_po', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tested By</Label>
              <Input 
                value={formData.tested_by}
                onChange={(e) => updateField('tested_by', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Reviewed By</Label>
              <Input 
                value={formData.reviewed_by}
                onChange={(e) => updateField('reviewed_by', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Items */}
      {formData.selectedRequest && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Results</CardTitle>
            {!readOnly && (
              <Button type="button" onClick={addItem} size="sm">
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.items.map((item) => (
              <Card key={item.id} className="border-muted/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.testMethodName || "Test Item"}</CardTitle>
                    {!readOnly && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Specimen Selection */}
                  <div className="grid gap-2">
                    <Label>Specimen ID</Label>
                    <Select 
                      value={item.specimenId || ""} 
                      onValueChange={(value) => {
                        if (value && value !== "no-specimens") {
                          // Find the specimen OID from the selectedRequest data
                          let specimenOid = ""
                          if (formData.selectedRequest) {
                            for (const sampleLot of formData.selectedRequest.sample_lots || []) {
                              const specimen = sampleLot.specimens?.find((spec: { specimen_oid: string; specimen_id: string }) => spec.specimen_id === value)
                              if (specimen) {
                                specimenOid = specimen.specimen_oid
                                break
                              }
                            }
                            
                            // Also check in global specimens if available
                            if (!specimenOid) {
                              const globalSpecimen = formData.selectedRequest.specimens?.find((spec: { specimen_oid: string; specimen_id: string }) => spec.specimen_id === value)
                              if (globalSpecimen) {
                                specimenOid = globalSpecimen.specimen_oid
                              }
                            }
                          }
                          
                          updateItem(item.id, { 
                            specimenId: value,
                            specimenOid: specimenOid
                          })
                        }
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select specimen" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.selectedRequest?.specimens
                          ?.filter((spec: { specimen_oid: string; specimen_id: string }) => spec.specimen_id && String(spec.specimen_id).trim() !== "")
                          .map((spec: { specimen_oid: string; specimen_id: string }) => (
                            <SelectItem key={spec.specimen_oid} value={String(spec.specimen_id)}>
                              {spec.specimen_id}
                            </SelectItem>
                          ))}
                        {(!formData.selectedRequest?.specimens || formData.selectedRequest.specimens.length === 0) && (
                          <SelectItem value="no-specimens" disabled>
                            No specimens available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Test Attributes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Test Equipment</Label>
                      <Input 
                        value={item.testEquipment}
                        onChange={(e) => updateItem(item.id, { testEquipment: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Sample Prep Method</Label>
                      <Input 
                        value={item.samplePrepMethod}
                        onChange={(e) => updateItem(item.id, { samplePrepMethod: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Material Grade</Label>
                      <Input 
                        value={item.materialGrade}
                        onChange={(e) => updateItem(item.id, { materialGrade: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Heat No</Label>
                      <Input 
                        value={item.heatNo}
                        onChange={(e) => updateItem(item.id, { heatNo: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Temperature</Label>
                      <Input 
                        value={item.temperature}
                        onChange={(e) => updateItem(item.id, { temperature: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Humidity</Label>
                      <Input 
                        value={item.humidity}
                        onChange={(e) => updateItem(item.id, { humidity: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  {/* Dynamic Test Results Table */}
                  <div>
                    <Label>Test Results</Label>
                    <div className="mt-2">
                      <DynamicTable
                        key={`${item.id}-${item.columns.length}`}
                        initialColumns={item.columns}
                        initialData={item.data}
                        onColumnsChange={(newCols) => updateItem(item.id, { columns: newCols as DynamicColumn[] })}
                        onDataChange={(newRows) => updateItem(item.id, { data: newRows as DynamicRow[] })}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="grid gap-2">
                    <Label>Comments</Label>
                    <Textarea
                      value={item.comments}
                      onChange={(e) => updateItem(item.id, { comments: e.target.value })}
                      disabled={readOnly}
                      rows={3}
                    />
                  </div>

                  {/* Image Upload */}
                  {item.hasImage && (
                    <div className="grid gap-2">
                      <Label>Test Images</Label>
                      {!readOnly && (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleImageUpload(item.id, e.target.files)
                              }
                            }}
                            className="hidden"
                            id={`image-upload-${item.id}`}
                          />
                          <label
                            htmlFor={`image-upload-${item.id}`}
                            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                          >
                            <div className="text-muted-foreground">
                              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Click to upload images
                            </span>
                          </label>
                        </div>
                      )}
                      
                      {/* Display uploaded images */}
                      {item.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          {item.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="border rounded-lg p-3 space-y-2">
                              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                                <img
                                  src={getFullImageUrl(image.image_url)}
                                  alt={`Test image ${imageIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Input
                                placeholder="Image caption..."
                                value={image.caption}
                                onChange={(e) => {
                                  const updatedImages = [...item.images]
                                  updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption: e.target.value }
                                  updateItem(item.id, { images: updatedImages })
                                }}
                                disabled={readOnly}
                                className="text-sm"
                              />
                              {!readOnly && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const imageToRemove = item.images[imageIndex]
                                    // Cleanup temporary URL if it exists
                                    if (imageToRemove.isTemporary && imageToRemove.image_url.startsWith('blob:')) {
                                      URL.revokeObjectURL(imageToRemove.image_url)
                                    }
                                    const updatedImages = item.images.filter((_, idx) => idx !== imageIndex)
                                    updateItem(item.id, { images: updatedImages })
                                  }}
                                  className="w-full"
                                >
                                  Remove Image
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {!readOnly && formData.selectedRequest && (
        <div className="flex justify-end">
          <Button type="submit" className="px-6">
            Save Test Report
          </Button>
        </div>
      )}
    </form>
  )
}
