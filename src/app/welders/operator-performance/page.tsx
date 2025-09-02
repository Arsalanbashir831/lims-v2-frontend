"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function OperatorPerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Performance Certificates</h1>
          <p className="text-muted-foreground">
            Manage operator performance certificates and evaluations
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Certificate
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Certificates</CardTitle>
          <CardDescription>
            A list of all operator performance certificates in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No performance certificates found</p>
            <Button asChild variant="outline">
              <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.NEW}>
                Create your first certificate
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
