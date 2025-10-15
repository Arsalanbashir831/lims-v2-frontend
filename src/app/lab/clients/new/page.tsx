"use client"

import { useRouter } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { clientService, CreateClientData } from "@/services/clients.service"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { FormHeader } from "@/components/common/form-header"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function NewClientPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: CreateClientData) => clientService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success("Client created successfully")
            router.push(ROUTES.APP.CLIENTS.ROOT)
        },
        onError: (error) => {
            toast.error("Failed to create client")
            console.error("Create error:", error)
        }
    })

    const handleSubmit = async (data: CreateClientData) => {
        createMutation.mutate(data)
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
                readOnly={createMutation.isPending}
            />
        </div>
    )
}
