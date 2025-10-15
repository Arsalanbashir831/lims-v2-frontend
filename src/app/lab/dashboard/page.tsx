"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LineChartComponent } from "@/components/ui/line-chart"
import { RefreshCw } from "lucide-react"
import { computeTrackingRows, TrackingRow } from "@/services/tracking.service"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { dashboardService, DashboardStats, JobsCurrentMonthStats, SampleLotsCurrentMonthStats } from "@/services/dashboard.service"
import { toast } from "sonner"

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [trackingRows, setTrackingRows] = useState<TrackingRow[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [jobsChartData, setJobsChartData] = useState<Array<{ name: string; value: number }>>([])
  const [sampleLotsChartData, setSampleLotsChartData] = useState<Array<{ name: string; value: number }>>([])
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)

  // Load dashboard statistics from backend
  const loadDashboardStats = async () => {
    setIsLoadingStats(true)
    try {
      const stats = await dashboardService.getAllStats()
      setDashboardStats(stats)
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
      toast.error("Failed to load dashboard statistics.")
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load chart data
  const loadChartData = async () => {
    setIsLoadingCharts(true)
    try {
      const [jobsData, sampleLotsData] = await Promise.all([
        dashboardService.getJobsCurrentMonthStats(),
        dashboardService.getSampleLotsCurrentMonthStats()
      ])

      // Transform jobs weekly data for chart
      const jobsWeeklyData = jobsData.weekly_breakdown.map((week) => ({
        name: `${week.week_start}`,
        value: week.jobs_count ?? 0
      }))
      setJobsChartData(jobsWeeklyData)

      // Transform sample lots weekly data for chart
      const sampleLotsWeeklyData = sampleLotsData.weekly_breakdown.map((week) => ({
        name: `${week.week_start}`,
        value: week.sample_lots_count ?? 0
      }))
      setSampleLotsChartData(sampleLotsWeeklyData)
    } catch (error) {
      console.error("Failed to load chart data:", error)
      toast.error("Failed to load chart data.")
    } finally {
      setIsLoadingCharts(false)
    }
  }

  useEffect(() => {
    loadDashboardStats()
    loadChartData()
  }, [])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([loadDashboardStats(), loadChartData()])
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
      <MetricsGrid 
        data={{
          totalSamplesReceived: dashboardStats?.sample_lots?.total_sample_lots ?? 0,
          totalRequestedRecords: dashboardStats?.jobs?.total_jobs ?? 0,
          totalTestReports: dashboardStats?.certificates?.total_certificates ?? 0,
          totalPqrReports: 0, // TODO: Add backend endpoint
          totalEquipments: dashboardStats?.equipment?.total_equipment ?? 0,
          totalTestMethods: dashboardStats?.test_methods?.total_test_methods ?? 0,
          calibrationTests: dashboardStats?.calibration_tests?.total_tests ?? 0,
          proficiencyTests: dashboardStats?.proficiency_tests?.total_tests ?? 0,
          discardedMaterials: 0, // TODO: Add backend endpoint
          totalClients: dashboardStats?.clients?.total_clients ?? 0,
        }}
        onMetricClick={(metricKey) => {}}
        isLoading={isLoadingStats}
      />

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Jobs Per Week Chart */}
        <LineChartComponent
          title="Sample Received Per Month"
          description="Monthly sample receiving trends"
          data={jobsChartData}
          height={300}
          color="chart-1"
        />

        {/* Sample Lots Per Week Chart */}
        <LineChartComponent
          title="Requested Records Per Month"
          description="Monthly record request trends"
          data={sampleLotsChartData}
          height={300}
          color="chart-2"
        />
      </div>
    </div>
  )
}

