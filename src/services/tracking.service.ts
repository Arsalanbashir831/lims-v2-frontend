import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { samplePreparationService } from "@/services/sample-preparation.service"
import { testReportsService } from "@/services/test-reports.service"
import { listDiscardedMaterials, type DiscardedMaterial } from "@/lib/discarded-materials"
import { jobsService, type Job, type JobsResponse } from "@/services/jobs.service"
import { api } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"

export type TrackingStatus = "received" | "in_preparation" | "reported" | "discarded"

export interface TrackingRow {
  id: string
  sampleId: string // This will be job_id from API
  status: TrackingStatus
  receivedDate: string // This will be receive_date from API
  preparationDate?: string
  reportDate?: string
  discardedDate?: string
  clientName: string // This will be client_name from API
  projectName: string // This will be project_name from API
  sampleType: string
  materialGrade: string
  testMethods: string[]
  equipmentUsed: string[]
  operatorName: string
  notes?: string
  itemsCount: number // This will be sample_lots_count from API
  specimensCount: number
  latestStatus: string
  // Additional fields from jobs API
  endUser?: string
  receivedBy?: string
  remarks?: string
  jobCreatedAt?: string
  // Additional fields for request and certificate info
  requestNo?: string
  certificateId?: string
  // Detailed data for tabs
  items?: Array<{
    id: string
    description: string
    heatNo: string
    methods: string[]
    status: string
  }>
  preparations?: Array<{
    requestNo: string
    item: string
    method: string
    specimens: number
    status: string
    date: string
  }>
  reports?: Array<{
    reportNo: string
    issueDate: string
    items: number
    status: string
    downloadUrl?: string
  }>
  discards?: Array<{
    reason: string
    date: string
    specimens: number
    operator: string
    notes?: string
  }>
}

// Transform Job API data to TrackingRow format
export function transformJobToTrackingRow(job: Job): TrackingRow {
  // Determine status based on sample_lots_count and other factors
  let status: TrackingStatus = "received"
  if (job.sample_lots_count > 0) {
    status = "in_preparation" // Has sample lots, likely in preparation
  }
  
  // Format receive_date to display format
  const receivedDate = new Date(job.receive_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })

  return {
    id: job.id,
    sampleId: job.job_id,
    status,
    receivedDate,
    clientName: job.client_name,
    projectName: job.project_name,
    itemsCount: job.sample_lots_count,
    specimensCount: 0, // Will be calculated from sample lots if needed
    latestStatus: status,
    receivedBy: job.received_by || undefined,
    remarks: job.remarks || undefined,
    jobCreatedAt: job.job_created_at || undefined,
    requestNo: job.request_numbers || undefined, 
    certificateId: job.certificate_numbers || undefined,
    // Default values for fields not in jobs API
    sampleType: "Unknown",
    materialGrade: "Unknown", 
    testMethods: [],
    equipmentUsed: [],
    operatorName: job.received_by || "Unknown",
    notes: job.remarks || undefined,
    // Add dummy detailed data for now
    items: job.sample_lots_count > 0 ? [
      {
        id: `${job.job_id}-001`,
        description: `Sample from ${job.project_name}`,
        heatNo: "H123456",
        methods: ["Chemical Analysis", "Tensile Test"],
        status: "In Progress"
      }
    ] : [],
    preparations: job.sample_lots_count > 0 ? [
      {
        requestNo: `REQ-${job.job_id}`,
        item: `${job.job_id}-001`,
        method: "Chemical Analysis",
        specimens: 3,
        status: "In Progress",
        date: receivedDate
      }
    ] : [],
    reports: [],
    discards: []
  }
}

// Fetch real jobs data from API
export async function fetchTrackingRowsFromAPI(): Promise<TrackingRow[]> {
  try {
    // Use the new endpoint that includes certificates and request numbers
    const response = await api.get(API_ROUTES.Lab_MANAGERS.JOBS_WITH_CERTIFICATES, { 
      searchParams: { limit: '100' } 
    }).json<JobsResponse>()
    return response.data.map(transformJobToTrackingRow)
  } catch (error) {
    console.error('Error fetching jobs data:', error)
    return []
  }
}

export function computeTrackingRows(): TrackingRow[] {
  // Dummy data for visualization
  return [
    {
      id: "1",
      sampleId: "MTL-2025-0001",
      status: "reported",
      receivedDate: "2025-01-15",
      preparationDate: "2025-01-18",
      reportDate: "2025-01-22",
      clientName: "ARAMCO",
      projectName: "Pipeline Integrity Assessment - Phase 2",
      sampleType: "Pipe Section",
      materialGrade: "API 5L X65",
      testMethods: ["Chemical Analysis", "Tensile Test", "Hardness Test"],
      equipmentUsed: ["OES Spectrometer", "Universal Testing Machine", "Hardness Tester"],
      operatorName: "Ahmed Al-Khalil",
      notes: "Standard testing completed as per ASTM specifications",
      itemsCount: 3,
      specimensCount: 12,
      latestStatus: "reported",
      items: [
        {
          id: "ITM-001",
          description: "6\" Pipe Section - Longitudinal",
          heatNo: "H123456",
          methods: ["Chemical Analysis", "Tensile Test"],
          status: "Completed"
        },
        {
          id: "ITM-002", 
          description: "6\" Pipe Section - Transverse",
          heatNo: "H123456",
          methods: ["Hardness Test", "Impact Test"],
          status: "Completed"
        },
        {
          id: "ITM-003",
          description: "Weld Joint Sample",
          heatNo: "W789012",
          methods: ["Chemical Analysis", "Hardness Test"],
          status: "Completed"
        }
      ],
      preparations: [
        {
          requestNo: "REQ-2025-0001",
          item: "6\" Pipe Section - Longitudinal",
          method: "Chemical Analysis",
          specimens: 4,
          status: "Completed",
          date: "2025-01-18"
        },
        {
          requestNo: "REQ-2025-0002",
          item: "6\" Pipe Section - Transverse", 
          method: "Tensile Test",
          specimens: 4,
          status: "Completed",
          date: "2025-01-19"
        },
        {
          requestNo: "REQ-2025-0003",
          item: "Weld Joint Sample",
          method: "Hardness Test",
          specimens: 4,
          status: "Completed", 
          date: "2025-01-20"
        }
      ],
      reports: [
        {
          reportNo: "CERT-2025-0001",
          issueDate: "2025-01-22",
          items: 3,
          status: "Issued",
          downloadUrl: "/reports/CERT-2025-0001.pdf"
        }
      ],
      discards: []
    },
    {
      id: "2", 
      sampleId: "MTL-2025-0002",
      status: "in_preparation",
      receivedDate: "2025-01-20",
      preparationDate: "2025-01-23",
      clientName: "SABIC",
      projectName: "Petrochemical Plant Equipment Validation",
      sampleType: "Welded Joint",
      materialGrade: "ASTM A106 Gr.B",
      testMethods: ["Radiographic Testing", "Ultrasonic Testing", "Dye Penetrant"],
      equipmentUsed: ["X-Ray Machine", "UT Flaw Detector", "PT Kit"],
      operatorName: "Jawad Al-Hajri",
      notes: "NDT testing in progress, preliminary results look good",
      itemsCount: 2,
      specimensCount: 8,
      latestStatus: "in_preparation",
      items: [
        {
          id: "ITM-004",
          description: "Circumferential Weld Joint",
          heatNo: "W456789",
          methods: ["Radiographic Testing", "Ultrasonic Testing"],
          status: "In Progress"
        },
        {
          id: "ITM-005",
          description: "Longitudinal Weld Joint",
          heatNo: "W456790",
          methods: ["Dye Penetrant", "Ultrasonic Testing"],
          status: "Pending"
        }
      ],
      preparations: [
        {
          requestNo: "REQ-2025-0004",
          item: "Circumferential Weld Joint",
          method: "Radiographic Testing",
          specimens: 4,
          status: "In Progress",
          date: "2025-01-23"
        },
        {
          requestNo: "REQ-2025-0005",
          item: "Circumferential Weld Joint",
          method: "Ultrasonic Testing",
          specimens: 4,
          status: "Completed",
          date: "2025-01-24"
        },
        {
          requestNo: "REQ-2025-0006",
          item: "Longitudinal Weld Joint",
          method: "Dye Penetrant",
          specimens: 0,
          status: "Pending",
          date: "2025-01-26"
        }
      ],
      reports: [],
      discards: []
    },
    {
      id: "3",
      sampleId: "MTL-2025-0003", 
      status: "received",
      receivedDate: "2025-01-25",
      clientName: "Zeeco Middle East",
      projectName: "Mechanical & OES Testing",
      sampleType: "Reducer Fitting",
      materialGrade: "ASTM A234 WPB",
      testMethods: ["Chemical Analysis", "Mechanical Properties"],
      equipmentUsed: ["OES Spectrometer", "Tensile Machine"],
      operatorName: "Hassan Al-Mahmoud",
      notes: "Sample received, awaiting preparation scheduling",
      itemsCount: 4,
      specimensCount: 16,
      latestStatus: "received"
    },
    {
      id: "4",
      sampleId: "MTL-2025-0004",
      status: "discarded",
      receivedDate: "2025-01-10",
      preparationDate: "2025-01-12",
      discardedDate: "2025-01-28",
      clientName: "Ma'aden",
      projectName: "Mining Equipment Quality Control",
      sampleType: "Steel Plate",
      materialGrade: "ASTM A572 Gr.50",
      testMethods: ["Impact Test", "Hardness Test"],
      equipmentUsed: ["Charpy Impact Tester", "Brinell Hardness Tester"],
      operatorName: "Omar Al-Rashid",
      notes: "Sample damaged during preparation, discarded as per protocol",
      itemsCount: 1,
      specimensCount: 3,
      latestStatus: "discarded",
      items: [
        {
          id: "ITM-006",
          description: "Steel Plate - Thickness 25mm",
          heatNo: "S789123",
          methods: ["Impact Test", "Hardness Test"],
          status: "Discarded"
        }
      ],
      preparations: [
        {
          requestNo: "REQ-2025-0007",
          item: "Steel Plate - Thickness 25mm",
          method: "Impact Test",
          specimens: 3,
          status: "Failed",
          date: "2025-01-12"
        }
      ],
      reports: [],
      discards: [
        {
          reason: "Sample damaged during machining",
          date: "2025-01-28",
          specimens: 3,
          operator: "Omar Al-Rashid",
          notes: "Crack developed during specimen preparation. Unable to proceed with testing. Client notified."
        }
      ]
    },
    {
      id: "5",
      sampleId: "MTL-2025-0005",
      status: "reported",
      receivedDate: "2025-01-08",
      preparationDate: "2025-01-11",
      reportDate: "2025-01-19",
      clientName: "ADNOC",
      projectName: "Offshore Platform Structural Analysis",
      sampleType: "Structural Steel",
      materialGrade: "ASTM A992",
      testMethods: ["Tensile Test", "Charpy Impact", "Chemical Analysis"],
      equipmentUsed: ["Universal Testing Machine", "Impact Tester", "OES"],
      operatorName: "Khalid Al-Zahra",
      notes: "All tests passed, report issued to client",
      itemsCount: 5,
      specimensCount: 20,
      latestStatus: "reported"
    },
    {
      id: "6",
      sampleId: "MTL-2025-0006",
      status: "in_preparation",
      receivedDate: "2025-01-22",
      preparationDate: "2025-01-24",
      clientName: "SWCC",
      projectName: "Desalination Plant Piping System",
      sampleType: "Pipe Elbow",
      materialGrade: "ASTM A403 WP316L",
      testMethods: ["Corrosion Test", "Pressure Test", "Dimensional Check"],
      equipmentUsed: ["Corrosion Chamber", "Hydrostatic Tester", "CMM"],
      operatorName: "Fahad Al-Mutairi",
      notes: "Corrosion testing underway, expected completion in 3 days",
      itemsCount: 2,
      specimensCount: 6,
      latestStatus: "in_preparation"
    },
    {
      id: "7",
      sampleId: "MTL-2025-0007",
      status: "received",
      receivedDate: "2025-01-26",
      clientName: "SEC",
      projectName: "Power Plant Boiler Tube Inspection",
      sampleType: "Boiler Tube",
      materialGrade: "ASTM A213 T22",
      testMethods: ["Metallographic Exam", "Hardness Test", "Chemical Analysis"],
      equipmentUsed: ["Microscope", "Hardness Tester", "OES Spectrometer"],
      operatorName: "Nasser Al-Qahtani",
      notes: "High priority sample, expedited processing requested",
      itemsCount: 3,
      specimensCount: 9,
      latestStatus: "received"
    },
    {
      id: "8",
      sampleId: "MTL-2025-0008",
      status: "reported",
      receivedDate: "2025-01-05",
      preparationDate: "2025-01-07",
      reportDate: "2025-01-14",
      clientName: "YASREF",
      projectName: "Refinery Catalyst Reactor Analysis",
      sampleType: "Reactor Vessel Sample",
      materialGrade: "ASTM A387 Gr.22",
      testMethods: ["Creep Test", "Stress Rupture", "Microstructure Analysis"],
      equipmentUsed: ["Creep Testing Machine", "Metallurgical Microscope"],
      operatorName: "Abdullah Al-Shehri",
      notes: "Long-term testing completed, excellent material properties",
      itemsCount: 1,
      specimensCount: 4,
      latestStatus: "reported"
    }
  ]
}

export { listSampleReceivings, listDiscardedMaterials }
export type { SampleReceiving, DiscardedMaterial }
