"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { clientService, Client, UpdateClientData } from "@/services/clients.service"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const id = params.id as string

  const { data: client, isLoading: loading, error } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => {
      console.log(`🔄 Fetching client details for ID: ${id}`)
      return clientService.getById(id)
    },
    enabled: !!id,
  })

  // Debug logging
  console.log("📊 Edit page - client data:", client)

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientData) => clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
      toast.success("Client updated successfully")
      router.push(ROUTES.APP.CLIENTS.ROOT)
    },
    onError: (error) => {
      toast.error("Failed to update client")
      console.error("Update error:", error)
    }
  })

  const handleSubmit = async (data: UpdateClientData) => {
    updateMutation.mutate(data)
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.CLIENTS.ROOT)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading client...</div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Client not found</div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Client" description="Edit client information" label={null} href={ROUTES.APP.CLIENTS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      
      <ClientForm
        key={client?.id} // Force re-render when client changes
        initialData={client}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing || updateMutation.isPending}
      />
    </div>
  )
}
