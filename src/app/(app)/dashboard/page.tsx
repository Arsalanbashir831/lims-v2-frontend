"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChartComponent } from "@/components/ui/line-chart"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  TestTube, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Database,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Wrench,
  Award,
  Trash2
} from "lucide-react"
import { computeTrackingRows } from "@/lib/tracking"

// Enhanced mock data for charts and metrics
const mockData = {
  // Core Metrics
  totalSamplesReceived: 139,
  totalRequestedRecords: 186,
  totalTestReports: 144,
  totalPqrReports: 21,
  totalEquipments: 108,
  totalTestMethods: 63,
  calibrationTests: 65,
  proficiencyTests: 6,
  discardedMaterials: 0,
  
  // Monthly data for charts
  monthlySamples: [
    { name: "2025-03", value: 18 },
    { name: "2025-04", value: 22 },
    { name: "2025-05", value: 25 },
    { name: "2025-06", value: 28 },
    { name: "2025-07", value: 24 },
    { name: "2025-08", value: 22 }
  ],
  monthlyRequests: [
    { name: "2025-03", value: 25 },
    { name: "2025-04", value: 32 },
    { name: "2025-05", value: 38 },
    { name: "2025-06", value: 42 },
    { name: "2025-07", value: 35 },
    { name: "2025-08", value: 14 }
  ],
  
  // Recent Activity
  recentActivity: [
    { id: 1, type: "sample_received", message: "New sample received from ALRASHED FASTNERS", time: "2 hours ago", status: "success" },
    { id: 2, type: "test_completed", message: "Tensile test completed for Sample #SR-2025-001", time: "4 hours ago", status: "success" },
    { id: 3, type: "equipment_calibration", message: "Equipment calibration due in 3 days", time: "6 hours ago", status: "warning" },
    { id: 4, type: "report_generated", message: "Test report generated for Project SINSINA-WQT", time: "1 day ago", status: "success" },
    { id: 5, type: "sample_preparation", message: "Sample preparation started for 3 specimens", time: "1 day ago", status: "info" }
  ],
  
  // Equipment Status
  equipmentStatus: [
    { name: "Tensile Testing Machine", status: "operational", lastCalibration: "2025-01-15", nextCalibration: "2025-07-15" },
    { name: "Hardness Tester", status: "operational", lastCalibration: "2025-01-20", nextCalibration: "2025-07-20" },
    { name: "Impact Testing Machine", status: "maintenance", lastCalibration: "2025-01-10", nextCalibration: "2025-07-10" },
    { name: "Chemical Analyzer", status: "operational", lastCalibration: "2025-01-25", nextCalibration: "2025-07-25" }
  ]
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [trackingRows, setTrackingRows] = useState([])

  useEffect(() => {
    const loadTrackingRows = async () => {
      try {
        const rows = await computeTrackingRows()
        setTrackingRows(rows)
      } catch (error) {
        console.error("Failed to load tracking rows:", error)
      }
    }
    loadTrackingRows()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "error": return "text-red-600 bg-red-100"
      default: return "text-blue-600 bg-blue-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4" />
      case "warning": return <AlertTriangle className="w-4 h-4" />
      case "error": return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500"
      case "maintenance": return "bg-yellow-500"
      case "offline": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your LIMS system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics - 5x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples Received</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalSamplesReceived}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requested Records</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalRequestedRecords}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Reports</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalTestReports}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
              {Math.round((mockData.totalTestReports / mockData.totalSamplesReceived) * 100)}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PQR Reports</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalPqrReports}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="w-3 h-3 mr-1 text-blue-600" />
              Active procedures
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipments</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalEquipments}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Wrench className="w-3 h-3 mr-1 text-blue-600" />
              Laboratory assets
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Methods</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalTestMethods}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TestTube className="w-3 h-3 mr-1 text-blue-600" />
              Available methods
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calibration Tests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.calibrationTests}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1 text-yellow-600" />
              Due for calibration
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proficiency Tests</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.proficiencyTests}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
              Active programs
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discarded Materials</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.discardedMaterials}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
              No materials discarded
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sample Received Per Month Chart */}
        <LineChartComponent
          title="Sample Received Per Month"
          description="Monthly sample receiving trends"
          data={mockData.monthlySamples}
          height={300}
          color="chart-1"
        />

        {/* Requested Records Per Month Chart */}
        <LineChartComponent
          title="Requested Records Per Month"
          description="Monthly record request trends"
          data={mockData.monthlyRequests}
          height={300}
          color="chart-2"
        />
      </div>
    </div>
  )
}


