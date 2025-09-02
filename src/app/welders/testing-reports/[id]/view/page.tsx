"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, FileText } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface ViewTestingReportPageProps {
  params: {
    id: string
  }
}

export default function ViewTestingReportPage({ params }: ViewTestingReportPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testing Report Details</h1>
            <p className="text-muted-foreground">
              View testing report information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.EDIT(params.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Report Information
              <Badge variant="outline" className="text-green-600 border-green-200">
                Pass
              </Badge>
            </CardTitle>
            <CardDescription>
              Report ID: {params.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Report Number</Label>
                <p className="text-sm">TR-2024-001</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Welder Name</Label>
                <p className="text-sm">John Smith</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Test Type</Label>
                <p className="text-sm">Qualification Test</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Test Date</Label>
                <p className="text-sm">April 15, 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Process Used</Label>
                <p className="text-sm">GTAW</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                <p className="text-sm">1G, 2G</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Test Result</Label>
                <p className="text-sm">Pass</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Inspector</Label>
                <p className="text-sm">Mike Wilson</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Material Specification</Label>
              <p className="text-sm">A36 Carbon Steel</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Excellent weld quality with proper penetration and no defects observed. The welder demonstrated 
              good technique and control throughout the testing process. All visual inspections passed and 
              the weld meets the required standards for the specified position and process.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Welder demonstrates proficiency and is recommended for certification. The candidate shows 
              excellent understanding of the welding process and safety procedures. Recommend proceeding 
              with full qualification certificate issuance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
