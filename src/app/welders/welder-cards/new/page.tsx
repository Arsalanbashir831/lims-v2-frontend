"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function NewWelderCardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Welder Card</h1>
          <p className="text-muted-foreground">
            Create a new welder identification card
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
          <CardDescription>
            Enter the details for the new welder card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="welderName">Welder Name</Label>
              <Input id="welderName" placeholder="Enter welder name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="Enter card number" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" placeholder="Enter employee ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="Enter department" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificationLevel">Certification Level</Label>
              <Input id="certificationLevel" placeholder="e.g., Certified, Advanced, Expert" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" placeholder="Enter contact number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations</Label>
            <Input id="specializations" placeholder="e.g., GTAW, SMAW, Structural Welding" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Enter any additional remarks" />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Create Card
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
