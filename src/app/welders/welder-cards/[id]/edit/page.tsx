"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface EditWelderCardPageProps {
  params: {
    id: string
  }
}

export default function EditWelderCardPage({ params }: EditWelderCardPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Welder Card</h1>
          <p className="text-muted-foreground">
            Update the welder card details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
          <CardDescription>
            Update the details for card ID: {params.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="welderName">Welder Name</Label>
              <Input id="welderName" placeholder="Enter welder name" defaultValue="Mike Wilson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="Enter card number" defaultValue="WC-2024-001" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" placeholder="Enter employee ID" defaultValue="EMP-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="Enter department" defaultValue="Fabrication" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" defaultValue="2024-03-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" defaultValue="2025-03-01" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificationLevel">Certification Level</Label>
              <Input id="certificationLevel" placeholder="e.g., Certified, Advanced, Expert" defaultValue="Advanced" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" placeholder="Enter contact number" defaultValue="+1234567890" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations</Label>
            <Input id="specializations" placeholder="e.g., GTAW, SMAW, Structural Welding" defaultValue="GTAW, SMAW, Structural Welding" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Enter any additional remarks" defaultValue="Experienced welder with excellent track record" />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Update Card
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
