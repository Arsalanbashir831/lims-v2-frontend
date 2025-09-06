import { SamplePreparationForm } from "@/components/sample-preparation/form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewSamplePreparationPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Sample Preparation" description="Create a new sample preparation" label={null} href={ROUTES.APP.SAMPLE_PREPARATION.ROOT}/>
      <SamplePreparationForm />
    </div>
  )
}


