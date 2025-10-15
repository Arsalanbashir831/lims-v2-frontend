import { ProficiencyTestingForm } from "@/components/proficiency-testing/form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewProficiencyTestingPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Proficiency Testing" description="Create a new proficiency testing" label={null} href={ROUTES.APP.PROFICIENCY_TESTING.ROOT}/>
      <ProficiencyTestingForm />
    </div>
  )
}


