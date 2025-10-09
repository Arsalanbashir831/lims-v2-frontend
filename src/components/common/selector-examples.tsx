"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ClientSelector, WelderSelector } from "./index"
import { Client } from "@/services/clients.service"
import { Welder } from "@/components/welders/welder-form"

// Example component showing how to use both selectors
export function SelectorExamples() {
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [selectedWelderId, setSelectedWelderId] = useState<string>("")
  const [selectedWelder, setSelectedWelder] = useState<Welder | undefined>()

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Client & Welder Selector Examples</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Select Client</Label>
            <ClientSelector
              value={selectedClientId}
              onValueChange={(clientId, client) => {
                setSelectedClientId(clientId || "")
                setSelectedClient(client)
              }}
              placeholder="Choose a client..."
            />
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedClient.client_name} - {selectedClient.phone}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Select Welder</Label>
            <WelderSelector
              value={selectedWelderId}
              onValueChange={(welderId, welder) => {
                setSelectedWelderId(welderId || "")
                setSelectedWelder(welder)
              }}
              placeholder="Choose a welder..."
            />
            {selectedWelder && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedWelder.operatorName} - {selectedWelder.operatorId}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
