"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { clientService, Client } from "@/lib/clients"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { FormHeader } from "@/components/common/form-header"

export default function NewClientPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (data: Client) => {
        try {
            setSaving(true)
            await clientService.create(data)
            toast.success("Client created successfully")
            router.push(ROUTES.APP.CLIENTS.ROOT)
        } catch (error) {
            toast.error("Failed to create client")
            console.error("Create error:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        router.push(ROUTES.APP.CLIENTS.ROOT)
    }

    return (
        <div className="grid gap-4">
            <FormHeader title="Add New Client" description="Create a new client" label={null} href={ROUTES.APP.CLIENTS.ROOT} />
            <ClientForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                readOnly={saving}
            />
        </div>
    )
}
