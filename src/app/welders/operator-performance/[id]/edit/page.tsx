"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface EditOperatorPerformancePageProps {
  params: {
    id: string
  }
}

export default function EditOperatorPerformancePage({ params }: EditOperatorPerformancePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Operator Performance Certificate</h1>
          <p className="text-muted-foreground">
            Update the operator performance certificate details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Information</CardTitle>
          <CardDescription>
            Update the details for certificate ID: {params.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operatorName">Operator Name</Label>
              <Input id="operatorName" placeholder="Enter operator name" defaultValue="Sarah Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input id="certificateNumber" placeholder="Enter certificate number" defaultValue="OP-2024-001" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performanceLevel">Performance Level</Label>
              <Input id="performanceLevel" placeholder="e.g., Level 1, Level 2, Advanced" defaultValue="Level 2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evaluationScore">Evaluation Score</Label>
              <Input id="evaluationScore" type="number" placeholder="Enter score (0-100)" defaultValue="85" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evaluationDate">Evaluation Date</Label>
              <Input id="evaluationDate" type="date" defaultValue="2024-02-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input id="validUntil" type="date" defaultValue="2025-02-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluatorName">Evaluator Name</Label>
            <Input id="evaluatorName" placeholder="Enter evaluator name" defaultValue="Mike Wilson" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Enter any additional remarks" defaultValue="Excellent performance in all evaluated areas" />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT}>
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Update Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
