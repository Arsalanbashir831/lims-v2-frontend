"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function TestingReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testing Reports</h1>
          <p className="text-muted-foreground">
            Manage welder testing reports and evaluations
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Report
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testing Reports</CardTitle>
          <CardDescription>
            A list of all welder testing reports in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No testing reports found</p>
            <Button asChild variant="outline">
              <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.NEW}>
                Create your first report
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
