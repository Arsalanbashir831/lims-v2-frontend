import { SampleInformationForm } from "@/components/sample-information/form"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"

export default function NewSampleInformationPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Sample Information" description="Create a new sample information" label={null} href={ROUTES.APP.SAMPLE_INFORMATION.ROOT}/>  
      <SampleInformationForm />
    </div>
  )
}
