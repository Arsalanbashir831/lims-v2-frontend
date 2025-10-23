"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TestReportForm } from "@/components/test-reports/test-report-form"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"
import { useTestReportDetail, useTestReportItems } from "@/hooks/use-test-reports"
import { type DynamicColumn, type DynamicRow } from "@/components/pqr/form/dynamic-table"

interface TestReportFormData {
  certificate_id: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
  selectedRequest: {
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
  }
  items: Array<{
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
    }>
  }>
}

export default function EditTestReportPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<TestReportFormData | null>(null)

  // Fetch data
  const { data: testReportResponse, isLoading: reportLoading, error: reportError } = useTestReportDetail(id || "")
  const { data: testReportItemsResponse, isLoading: itemsLoading, error: itemsError } = useTestReportItems(id || "")


  // Map API data to form data
  useEffect(() => {
    if (!testReportResponse?.data || !testReportItemsResponse?.data) return

    const report = testReportResponse.data
    const items = testReportItemsResponse.data

    // Map items
    const mappedItems = items.map((item) => {
      // Parse test results
      let testResults: { columns: string[], data: (string | number)[][] } = { columns: [], data: [] }
      try {
        if (item.specimen_sections?.[0]?.test_results) {
          const parsed = JSON.parse(item.specimen_sections[0].test_results)
          if (parsed.columns && parsed.data) {
            testResults = parsed
          }
        }
      } catch (e) {
        console.error("Failed to parse test results:", e)
      }

      // Create dynamic columns
      const dynamicColumns: DynamicColumn[] = testResults.columns?.map((colName: string, idx: number) => ({
        id: `col-${idx}`,
        header: colName,
        accessorKey: `col-${idx}`,
        type: "input"
      })) || [
        { id: "col-0", header: "Test Data", accessorKey: "col-0", type: "input" },
        { id: "col-1", header: "Result", accessorKey: "col-1", type: "input" },
        { id: "col-2", header: "Remarks", accessorKey: "col-2", type: "input" },
      ]

      // Create dynamic data rows
      const dynamicData: DynamicRow[] = testResults.data?.map((rowData: (string | number)[], rowIdx: number) => {
        const row: DynamicRow = {
          id: `row-${rowIdx + 1}`,
          label: rowData[0] || `Row ${rowIdx + 1}`,
          specimen_oid: item.specimen_sections?.[0]?.specimen_id || ""
        }
        dynamicColumns.forEach((col, colIdx) => {
          row[col.accessorKey] = rowData[colIdx] || ""
        })
        return row
      }) || [{ id: "row-1", label: "Row 1", "col-0": "", "col-1": "", "col-2": "" }]

      // Get specimen info from certificate items (primary source)
      const specimenOid = item.specimen_sections?.[0]?.specimen_id || ""
      const specimenName = (item.specimen_sections?.[0] as any)?.specimen_name || "Unknown Specimen"

      // Find the corresponding test method from the first API based on specimen name
      let testMethodInfo = null
      for (const lot of report.request_info?.sample_lots || []) {
        const specimen = lot.specimens?.find((spec: { specimen_oid: string; specimen_id: string }) => spec.specimen_id === specimenName)
        if (specimen) {
          testMethodInfo = lot.test_method
          break
        }
      }

      return {
        id: item._id,
        specimenId: specimenName,
        specimenOid: specimenOid,
        testMethodId: testMethodInfo?.test_method_oid || "",
        testMethodName: testMethodInfo?.test_name || "",
        testEquipment: item.equipment_name || "",
        samplePrepMethod: item.sample_preparation_method || "",
        sampleDescription: testMethodInfo ? 
          report.request_info?.sample_lots?.find((lot: any) => 
            lot.specimens?.some((spec: any) => spec.specimen_id === specimenName)
          )?.item_description || "" : 
          report.request_info?.sample_lots?.[0]?.item_description || "",
        materialGrade: item.material_grade || "",
        heatNo: item.heat_no || "",
        temperature: item.temperature || "",
        humidity: item.humidity || "",
        comments: item.comments || "",
        columns: dynamicColumns,
        data: dynamicData,
        hasImage: testMethodInfo?.hasImage || false,
        images: item.specimen_sections?.[0]?.images_list?.map((img: { image_url: string; caption: string }) => ({
          image_url: img.image_url,
          caption: img.caption || ""
        })) || []
      }
    })

    // Reconstruct selectedRequest
    const selectedRequest = report.request_info ? {
      id: report.request_info.request_id,
      request_no: report.request_info.request_no,
      sample_lots: report.request_info.sample_lots?.map((lot: {
        item_description: string;
        planned_test_date: string | null;
        dimension_spec: string | null;
        request_by: string | null;
        remarks: string | null;
        sample_lot_info?: {
          sample_lot_id: string;
          job_id: string;
          item_no: string;
          job_details?: {
            project_name: string;
          };
        };
        test_method: {
          test_method_oid: string;
          test_name: string;
        };
        specimens: Array<{
          specimen_oid: string;
          specimen_id: string;
        }>;
        specimens_count: number;
      }) => ({
        item_description: lot.item_description || "",
        planned_test_date: lot.planned_test_date || null,
        dimension_spec: lot.dimension_spec || null,
        request_by: lot.request_by || null,
        remarks: lot.remarks || null,
        sample_lot_id: lot.sample_lot_info?.sample_lot_id || "",
        test_method: {
          test_method_oid: lot.test_method?.test_method_oid || "",
          test_name: lot.test_method?.test_name || ""
        },
        job_id: lot.sample_lot_info?.job_id || "",
        item_no: lot.sample_lot_info?.item_no || "",
        client_name: null,
        project_name: lot.sample_lot_info?.job_details?.project_name || null,
        specimens: lot.specimens?.map((spec: { specimen_oid: string; specimen_id: string }) => ({
          specimen_oid: spec.specimen_oid,
          specimen_id: spec.specimen_id
        })) || [],
        specimens_count: lot.specimens_count || 0
      })) || [],
      sample_lots_count: report.request_info.sample_lots_count || 0,
      specimens: report.request_info.specimens || [],
      created_at: report.request_info.created_at || "",
      updated_at: report.request_info.updated_at || ""
    } : {
      id: "",
      request_no: "",
      sample_lots: [],
      sample_lots_count: 0,
      specimens: [],
      created_at: "",
      updated_at: ""
    }

    // Set form data
    const mappedFormData: TestReportFormData = {
      certificate_id: report.certificate_id || "",
      date_of_sampling: report.date_of_sampling,
      date_of_testing: report.date_of_testing,
      issue_date: report.issue_date,
      revision_no: report.revision_no,
      customers_name_no: report.customers_name_no,
      atten: report.atten,
      customer_po: report.customer_po,
      tested_by: report.tested_by,
      reviewed_by: report.reviewed_by,
      selectedRequest: selectedRequest,
      items: mappedItems,
    }

    setFormData(mappedFormData)
  }, [testReportResponse, testReportItemsResponse])

  // Handle form submission
  const handleSubmit = (data: TestReportFormData) => {
    // Form handles the submission internally, just handle navigation
    setIsEditing(false)
    router.push(ROUTES.APP.TEST_REPORTS.ROOT)
  }

  if (reportLoading || itemsLoading) {
    return (
      <div className="space-y-6">
        <FormHeader 
          title="Edit Test Report" 
          description="Update the test report details" 
          label={null} 
          href={ROUTES.APP.TEST_REPORTS.ROOT} 
        />
        <p className="text-sm text-muted-foreground">Loading test report details…</p>
      </div>
    )
  }

  if (reportError || itemsError || !testReportResponse) {
    return (
      <div className="space-y-6">
        <FormHeader 
          title="Edit Test Report" 
          description="Update the test report details" 
          label={null} 
          href={ROUTES.APP.TEST_REPORTS.ROOT} 
        />
        <p className="text-sm text-destructive">Failed to load test report details</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FormHeader 
        title="Edit Test Report" 
        description="Update the test report details" 
        label={null} 
        href={ROUTES.APP.TEST_REPORTS.ROOT}
      >
      {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            <XIcon className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </FormHeader>
      
      {formData ? (
        <TestReportForm 
          key={`edit-${id}-${isEditing}`}
          initialData={formData} 
          onSubmit={handleSubmit as any} 
          readOnly={!isEditing}
          isEditing={isEditing}
          certificateId={id}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}
