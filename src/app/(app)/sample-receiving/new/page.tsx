"use client"

import { useRouter } from "next/navigation"
import { SampleReceivingForm, type SampleReceivingFormData } from "@/components/sample-receiving/form"
import { createSampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"

export default function NewSampleReceivingPage() {
    const router = useRouter()

    const handleSubmit = (data: SampleReceivingFormData) => {
        createSampleReceiving({
            sampleId: data.sampleId,
            projectName: data.projectName,
            clientName: data.clientName,
            endUser: data.endUser,
            phone: data.phone,
            receiveDate: data.receiveDate,
            numItems: data.items.length,
            storageLocation: data.storageLocation,
            remarks: data.remarks,
            items: data.items,
        })
        toast.success("Sample saved")
        router.push("/sample-receiving")
    }

    return (
        <div className="grid gap-4">
            <h1 className="text-2xl font-bold">Sample Receiving Form</h1>
            <SampleReceivingForm onSubmit={handleSubmit} />
        </div>
    )
}
