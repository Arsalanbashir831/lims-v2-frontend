import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  descriptionIcon?: LucideIcon
  descriptionColor?: string
  onClick?: () => void
  isLoading?: boolean
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  descriptionIcon: DescriptionIcon,
  descriptionColor = "text-muted-foreground",
  onClick,
  isLoading = false
}: MetricCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className={`flex items-center text-xs ${descriptionColor}`}>
              {DescriptionIcon && <DescriptionIcon className="w-3 h-3 mr-1" />}
              {description}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

