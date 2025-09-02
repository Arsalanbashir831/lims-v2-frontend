"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function NewTestingReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Testing Report</h1>
          <p className="text-muted-foreground">
            Create a new welder testing report
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
          <CardDescription>
            Enter the details for the new testing report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportNumber">Report Number</Label>
              <Input id="reportNumber" placeholder="Enter report number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welderName">Welder Name</Label>
              <Input id="welderName" placeholder="Enter welder name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Input id="testType" placeholder="e.g., Qualification Test, Performance Test" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testDate">Test Date</Label>
              <Input id="testDate" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processUsed">Process Used</Label>
              <Input id="processUsed" placeholder="e.g., GTAW, SMAW, GMAW" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" placeholder="e.g., 1G, 2G, 3G, 4G" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testResult">Test Result</Label>
              <Input id="testResult" placeholder="e.g., Pass, Fail, Conditional Pass" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Enter inspector name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialSpecification">Material Specification</Label>
            <Input id="materialSpecification" placeholder="Enter material specification" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testObservations">Test Observations</Label>
            <Textarea id="testObservations" placeholder="Enter detailed test observations" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea id="recommendations" placeholder="Enter any recommendations" />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
