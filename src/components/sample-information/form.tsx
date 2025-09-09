"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClientSelector } from "@/components/common/client-selector"
import { Client, clientService } from "@/lib/clients"
import { SampleInformation, sampleInformationService, CreateSampleInformationData, UpdateSampleInformationData } from "@/lib/sample-information"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  initial?: SampleInformation
  readOnly?: boolean
}

export function SampleInformationForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [projectName, setProjectName] = useState(initial?.project_name ?? "")
  const [clientId, setClientId] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [endUser, setEndUser] = useState(initial?.end_user ?? "")
  const [receiveDate, setReceiveDate] = useState(
    initial?.receive_date ? new Date(initial.receive_date).toISOString().split('T')[0] : ""
  )
  const [receivedBy, setReceivedBy] = useState(initial && (initial as any).received_by ? String((initial as any).received_by) : "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const isEditing = Boolean(initial)

  // Load selected client when initial data is available (for edit mode)
  useEffect(() => {
    const loadSelectedClient = async () => {
      if (initial && !selectedClient) {
        try {
          // Check if we have client ID (from edit response) or client name (from list response)
          if ((initial as any).client && typeof (initial as any).client === 'number') {
            // We have client ID from edit response, get client details
            const client = await clientService.getById(String((initial as any).client))
            setSelectedClient(client)
            setClientId(client.id.toString())
          } else if ((initial as any).client_id && typeof (initial as any).client_id === 'string') {
            // API provides client_id on edit payload; fetch directly by id
            const client = await clientService.getById((initial as any).client_id)
            setSelectedClient(client)
            setClientId(client.id.toString())
          } else if (initial.client_name) {
            // We have client name, search for client
            const response = await clientService.search(initial.client_name, 1)
            const client = response.results.find(c => c.client_name === initial.client_name)
            if (client) {
              setSelectedClient(client)
              setClientId(client.id.toString())
            }
          }
        } catch (error) {
          console.error("Failed to load client:", error)
        }
      }
    }

    loadSelectedClient()
  }, [initial])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validation
    if (!projectName.trim()) {
      toast.error("Project name is required")
      return
    }
    
    if (!clientId.trim()) {
      toast.error("Client is required")
      return
    }
    
    if (!receiveDate.trim()) {
      toast.error("Receive date is required")
      return
    }

    const payload: CreateSampleInformationData = {
      project_name: projectName.trim(),
      client_id: clientId.trim(),
      end_user: endUser.trim() || undefined,
      receive_date: new Date(receiveDate.trim()).toISOString(),
      received_by: receivedBy.trim() || undefined,
      remarks: remarks.trim() || undefined,
    }

    // Handle create or update
    if (isEditing && initial) {
      sampleInformationService.update(initial.job_id, payload as UpdateSampleInformationData)
        .then((response) => { 
          queryClient.invalidateQueries({ queryKey: ['sample-information'] })
          toast.success("Sample information updated"); 
          router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT) 
        })
        .catch((error) => {
          console.error('Update failed:', error)
          // Show user-friendly error message
          if (error.message && error.message.includes('Invalid input')) {
            toast.error("Failed to update: Invalid data format")
          } else {
            toast.error("Failed to update: Please try again")
          }
        })
    } else {
      sampleInformationService.create(payload)
        .then((response) => { 
          queryClient.invalidateQueries({ queryKey: ['sample-information'] })
          toast.success("Sample information created"); 
          router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT) 
        })
        .catch((error) => {
          console.error('Create failed:', error)
          // Show user-friendly error message
          if (error.message && error.message.includes('Invalid input')) {
            toast.error("Failed to create: Invalid data format")
          } else {
            toast.error("Failed to create: Please try again")
          }
        })
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Sample Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Basic details to identify and track the incoming sample batch.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Project Name</Label>
            <Input placeholder="e.g., MICROSTRUCTURE UNIFORMITY OF HEAT TREATED BOLT" value={projectName} onChange={(e) => setProjectName(e.target.value)} disabled={readOnly} />
          </div>
                     <div className="grid gap-2">
             <Label>Client</Label>
             <ClientSelector
               value={clientId}
               onValueChange={(selectedClientId, client) => {
                 setClientId(selectedClientId || "")
                 setSelectedClient(client)
               }}
               placeholder="Select a client..."
               disabled={readOnly}
               selectedClient={selectedClient}
             />
           </div>
          <div className="grid gap-2">
            <Label>End User</Label>
            <Input placeholder="End user organization" value={endUser} onChange={(e) => setEndUser(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Received By</Label>
            <Input placeholder="Receiver name" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Receive Date</Label>
            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Remarks</Label>
            <Textarea placeholder="Additional notes about the batch or handling" value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={readOnly} />
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{isEditing ? "Update Sample Information" : "Save Sample Information"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}
