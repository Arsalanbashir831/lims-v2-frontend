"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface EditTestingReportPageProps {
  params: {
    id: string
  }
}

export default function EditTestingReportPage({ params }: EditTestingReportPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Testing Report</h1>
          <p className="text-muted-foreground">
            Update the testing report details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
          <CardDescription>
            Update the details for report ID: {params.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportNumber">Report Number</Label>
              <Input id="reportNumber" placeholder="Enter report number" defaultValue="TR-2024-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welderName">Welder Name</Label>
              <Input id="welderName" placeholder="Enter welder name" defaultValue="John Smith" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Input id="testType" placeholder="e.g., Qualification Test, Performance Test" defaultValue="Qualification Test" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testDate">Test Date</Label>
              <Input id="testDate" type="date" defaultValue="2024-04-15" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processUsed">Process Used</Label>
              <Input id="processUsed" placeholder="e.g., GTAW, SMAW, GMAW" defaultValue="GTAW" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" placeholder="e.g., 1G, 2G, 3G, 4G" defaultValue="1G, 2G" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testResult">Test Result</Label>
              <Input id="testResult" placeholder="e.g., Pass, Fail, Conditional Pass" defaultValue="Pass" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Enter inspector name" defaultValue="Mike Wilson" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialSpecification">Material Specification</Label>
            <Input id="materialSpecification" placeholder="Enter material specification" defaultValue="A36 Carbon Steel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testObservations">Test Observations</Label>
            <Textarea id="testObservations" placeholder="Enter detailed test observations" defaultValue="Excellent weld quality with proper penetration and no defects observed." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea id="recommendations" placeholder="Enter any recommendations" defaultValue="Welder demonstrates proficiency and is recommended for certification." />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Update Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
