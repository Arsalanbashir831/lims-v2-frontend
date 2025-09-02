"use client"

import { useRouter } from "next/navigation"
import { SampleReceivingForm, type SampleReceivingFormData } from "@/components/sample-receiving/form"
import { createSampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

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
        router.push(ROUTES.APP.SAMPLE_RECEIVING.ROOT)
    }

    return (
        <div className="grid gap-4">
            <FormHeader title="Sample Receiving Form" description="Create a new sample receiving form." label={null} href={ROUTES.APP.SAMPLE_RECEIVING.ROOT}/>
            <SampleReceivingForm onSubmit={handleSubmit} />
        </div>
    )
}
