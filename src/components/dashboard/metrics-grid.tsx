import { 
  TestTube, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  Clock,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Wrench,
  Award,
  Trash2,
  Database,
  Users
} from "lucide-react"
import { MetricCard } from "./metric-card"

interface MetricsData {
  totalSamplesReceived: number
  totalRequestedRecords: number
  totalTestReports: number
  totalPqrReports: number
  totalEquipments: number
  totalTestMethods: number
  calibrationTests: number
  proficiencyTests: number
  discardedMaterials: number
  totalClients: number
}

interface MetricsGridProps {
  data: MetricsData
  onMetricClick?: (metricKey: string) => void
  isLoading?: boolean
}

export function MetricsGrid({ data, onMetricClick, isLoading = false }: MetricsGridProps) {
  const completionRate = Math.round((data.totalTestReports / data.totalSamplesReceived) * 100) || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title="Total Samples Received"
        value={data.totalSamplesReceived}
        icon={TestTube}
        description="+12.5% from last month"
        descriptionIcon={TrendingUp}
        descriptionColor="text-green-600"
        onClick={() => onMetricClick?.('totalSamplesReceived')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total Requested Records"
        value={data.totalRequestedRecords}
        icon={ClipboardList}
        description="+8.2% from last month"
        descriptionIcon={TrendingUp}
        descriptionColor="text-green-600"
        onClick={() => onMetricClick?.('totalRequestedRecords')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total Test Reports"
        value={data.totalTestReports}
        icon={FileSpreadsheet}
        description={`${completionRate}% completion rate`}
        descriptionIcon={CheckCircle}
        descriptionColor="text-green-600"
        onClick={() => onMetricClick?.('totalTestReports')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total PQR Reports"
        value={data.totalPqrReports}
        icon={Award}
        description="Active procedures"
        descriptionIcon={Activity}
        descriptionColor="text-blue-600"
        onClick={() => onMetricClick?.('totalPqrReports')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total Equipments"
        value={data.totalEquipments}
        icon={Settings}
        description="Laboratory assets"
        descriptionIcon={Wrench}
        descriptionColor="text-blue-600"
        onClick={() => onMetricClick?.('totalEquipments')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total Test Methods"
        value={data.totalTestMethods}
        icon={Database}
        description="Available methods"
        descriptionIcon={TestTube}
        descriptionColor="text-blue-600"
        onClick={() => onMetricClick?.('totalTestMethods')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Calibration Tests"
        value={data.calibrationTests}
        icon={Wrench}
        description="Due for calibration"
        descriptionIcon={Clock}
        descriptionColor="text-yellow-600"
        onClick={() => onMetricClick?.('calibrationTests')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Proficiency Tests"
        value={data.proficiencyTests}
        icon={Award}
        description="Active programs"
        descriptionIcon={CheckCircle}
        descriptionColor="text-green-600"
        onClick={() => onMetricClick?.('proficiencyTests')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Discarded Materials"
        value={data.discardedMaterials}
        icon={Trash2}
        description="No materials discarded"
        descriptionIcon={CheckCircle}
        descriptionColor="text-green-600"
        onClick={() => onMetricClick?.('discardedMaterials')}
        isLoading={isLoading}
      />

      <MetricCard
        title="Total Clients"
        value={data.totalClients}
        icon={Users}
        description="Active clients"
        descriptionIcon={CheckCircle}
        descriptionColor="text-blue-600"
        onClick={() => onMetricClick?.('totalClients')}
        isLoading={isLoading}
      />
    </div>
  )
}

