"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { clientService, Client } from "@/lib/clients"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const id = params.id as string

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true)
        const data = await clientService.getById(id)
        if (data) {
          setClient(data)
        } else {
          toast.error("Client not found")
          router.push(ROUTES.APP.CLIENTS.ROOT)
        }
      } catch (error) {
        toast.error("Failed to load client")
        console.error("Load error:", error)
        router.push(ROUTES.APP.CLIENTS.ROOT)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadClient()
    }
  }, [id, router])

  const handleSubmit = async (data: Client) => {
    try {
      setSaving(true)
      await clientService.update(id, data)
      toast.success("Client updated successfully")
      router.push(ROUTES.APP.CLIENTS.ROOT)
    } catch (error) {
      toast.error("Failed to update client")
      console.error("Update error:", error)
    } finally {
      setSaving(false)
    }
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

  if (!client) {
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
        initialData={client}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
