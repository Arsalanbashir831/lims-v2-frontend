"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { TestReport } from "@/lib/test-reports"
import { generateReportNo, type CertificateDetails, type ReportItem } from "@/lib/test-reports"
import { samplePreparationService } from "@/lib/sample-preparation"
import { listSampleReceivings } from "@/lib/sample-receiving"
import { completeCertificateService, type CompleteCertificate } from "@/lib/complete-certificates"
import { DynamicTable, type DynamicColumn, type DynamicRow } from "@/components/pqr/form/dynamic-table"
import { RequestSelector } from "@/components/common/request-selector"
import { EquipmentSelector } from "@/components/common/equipment-selector"

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

function genLocalId(): string { return `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}` }

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
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [certificate, setCertificate] = useState<CertificateDetails>(initialData?.certificate ?? {
    date_of_sampling: "", date_of_testing: "", issue_date: "", gripco_ref_no: "", revision_no: "",
    client_name: "", customer_name_no: "", atten: "", customer_po: "",
    project_name: "", name_of_laboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM", 
    address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia", tested_by: "", reviewed_by: "",
  })
  const [items, setItems] = useState<ReportItem[]>(initialData?.items ?? [])

  const recMap = useMemo(() => new Map(listSampleReceivings().map(r => [r.id, r])), [])

  // Load detailed preparation data when a request is selected
  useEffect(() => {
    if (!selectedRequest) return
    
    const loadDetailedPreparationData = async () => {
      try {
        console.log('Loading detailed preparation data for request:', selectedRequest.request_id)
        
        // Call GET_SAMPLE_PREPARATION API to get all details
        const detailedData = await samplePreparationService.getById(selectedRequest.request_id)
        console.log('Loaded detailed preparation data:', detailedData)
        
        // Map the detailed data to certificate fields
        const apiResponse = detailedData as any
        const newCertificate = {
          date_of_sampling: certificate.date_of_sampling,
          date_of_testing: certificate.date_of_testing,
          issue_date: certificate.issue_date,
          gripco_ref_no: apiResponse.job_id || selectedRequest.job_id || "",
          revision_no: certificate.revision_no,
          client_name: apiResponse.client_details?.name || selectedRequest.client_details?.name || "",
          customer_name_no: certificate.customer_name_no,
          atten: certificate.atten,
          customer_po: certificate.customer_po,
          project_name: apiResponse.job_project_name || selectedRequest.job_project_name || "",
          name_of_laboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
          address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
          tested_by: certificate.tested_by,
          reviewed_by: certificate.reviewed_by,
        }
        
        console.log('Auto-filling certificate with detailed data:', newCertificate)
        setCertificate(newCertificate)
        
        // Seed items based on the detailed preparation data
        if (apiResponse.test_items && apiResponse.test_items.length > 0) {
          const seeded: ReportItem[] = apiResponse.test_items.map((item: any, index: number) => {
            console.log(`Processing test item ${index + 1}:`, item)
            
            // Create dynamic columns based on test_method_details.test_columns
            const dynamicColumns: DynamicColumn[] = item.test_method_details?.test_columns?.map((columnName: string, colIndex: number) => ({
              id: `col-${colIndex}`,
              header: columnName,
              accessorKey: `col-${colIndex}`,
              type: "input" // All columns as input fields
            })) || fallbackColumns()
            
            // Create initial data rows based on specimens (without specimen IDs in table)
            const initialData: DynamicRow[] = item.specimens?.map((specimen: any, specIndex: number) => ({
              id: `row-${specIndex + 1}`,
              label: specimen.specimen_id || `Specimen ${specIndex + 1}`,
              ...dynamicColumns.reduce((acc, col) => {
                acc[col.accessorKey] = "" // Empty values for input columns
                return acc
              }, {} as any)
            })) || [{ id: "row-1", label: "" } as DynamicRow]
            
            return {
              id: genLocalId(),
              preparationItemId: item.id?.toString() || "",
              specimenId: item.specimens?.[0]?.specimen_id || "",
              testMethodId: item.test_method_details?.id || item.test_method_name || "",
              testMethodName: item.test_method_details?.test_name || item.test_method_name || "",
              testEquipment: "",
              testEquipmentId: "",
              samplePrepMethod: "",
              sampleDescription: "",
              materialGrade: "",
              heatNo: "",
              temperature: "",
              humidity: "",
              comments: item.test_method_details?.comments || "",
              columns: dynamicColumns,
              data: initialData,
            }
          })
          console.log('Seeded test items with dynamic columns:', seeded)
          setItems(seeded)
        }
      } catch (error) {
        console.error("Failed to load detailed preparation data:", error)
        
        // Fallback to basic request data if detailed API fails
        console.log('Falling back to basic request data for auto-fill')
        const fallbackCertificate = {
          date_of_sampling: certificate.date_of_sampling,
          date_of_testing: certificate.date_of_testing,
          issue_date: certificate.issue_date,
          gripco_ref_no: selectedRequest.job_id || "",
          revision_no: certificate.revision_no,
          client_name: selectedRequest.client_details?.name || "",
          customer_name_no: certificate.customer_name_no,
          atten: certificate.atten,
          customer_po: certificate.customer_po,
          project_name: selectedRequest.job_project_name || "",
          name_of_laboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
          address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
          tested_by: certificate.tested_by,
          reviewed_by: certificate.reviewed_by,
        }
        setCertificate(fallbackCertificate)
      }
    }
    
    loadDetailedPreparationData()
  }, [selectedRequest])

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
    }
    setItems(prev => [...prev, clone])
  }, [items, selectedRequest])

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preparationId || !selectedRequest) return

    try {
      // Transform form data to API format
      const certificateData: CompleteCertificate = {
        request_id: selectedRequest.request_id || selectedRequest.id || "",
        date_of_sampling: certificate.date_of_sampling,
        date_of_testing: certificate.date_of_testing,
        issue_date: certificate.issue_date,
        gripco_ref_no: certificate.gripco_ref_no,
        revision_no: certificate.revision_no,
        client_name: certificate.client_name,
        customer_name_no: certificate.customer_name_no,
        atten: certificate.atten,
        customer_po: certificate.customer_po,
        project_name: certificate.project_name,
        name_of_laboratory: certificate.name_of_laboratory,
        address: certificate.address,
        tested_by: certificate.tested_by,
        reviewed_by: certificate.reviewed_by,
        certificate_items_json: items.map(item => {
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
          
          return {
            test_items_id: item.preparationItemId,
            specimen_id: item.specimenId,
            calibration_equipment_id: item.testEquipmentId,
            sample_description: item.sampleDescription,
            sample_preparation_method: item.samplePrepMethod,
            material_grade: item.materialGrade,
            temperature: item.temperature,
            humidity: item.humidity,
            po_number: certificate.customer_po,
            mtc_no: "", // This would need to be added to the form if required
            heat_no: item.heatNo,
            comments: item.comments,
            specimen_sections: [{
              test_results: testResults
            }]
          }
        })
      }

      console.log('Submitting certificate data:', certificateData)
      
      // Call the API
      const response = await completeCertificateService.create(certificateData)
      console.log('Certificate created successfully:', response)
      
      // Call the original onSubmit for local storage (if needed)
      onSubmit({ 
        reportNo: generateReportNo(), // Generate report number automatically
        preparationId, 
        certificate, 
        items 
      })
      
    } catch (error) {
      console.error('Failed to create certificate:', error)
      // Handle error (show toast, etc.)
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
              value={selectedRequest?.request_id || selectedRequest?.id || ""}
              onValueChange={(requestId, request) => {
                console.log('RequestSelector onValueChange:', { requestId, request })
                setPreparationId(request?.request_id || requestId || "")
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
              ["gripco_ref_no", "Gripco Ref No", "text", true],
              ["revision_no", "Revision No", "text", false],
              ["client_name", "Client Name", "text", false],
              ["customer_name_no", "Customer's Name & no.", "text", false],
              ["atten", "Atten", "text", false],
              ["customer_po", "Customer PO", "text", false],
              ["project_name", "Project Name", "text", true],
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
                      <Select value={it.specimenId} onValueChange={(value) => updateItem(it.id, { specimenId: value })} disabled={readOnly}>
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
                        <EquipmentSelector
                          value={it.testEquipmentId}
                          onValueChange={(equipmentId, equipment) => {
                            updateItem(it.id, { 
                              testEquipmentId: equipmentId || "",
                              testEquipment: equipment?.equipmentName || ""
                            })
                          }}
                          placeholder="Select test equipment"
                          disabled={readOnly}
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
                          disabled={readOnly}
                          placeholder="Enter sample description"
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


