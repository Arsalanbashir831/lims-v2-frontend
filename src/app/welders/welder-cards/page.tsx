"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function WelderCardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welder Cards</h1>
          <p className="text-muted-foreground">
            Manage welder identification cards and credentials
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Card
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welder Cards</CardTitle>
          <CardDescription>
            A list of all welder identification cards in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No welder cards found</p>
            <Button asChild variant="outline">
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.NEW}>
                Create your first card
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
