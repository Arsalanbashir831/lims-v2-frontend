import { TestMethodForm } from "@/components/test-methods/form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewTestMethodPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Test Method" description="Create a new test method" label={null} href={ROUTES.APP.TEST_METHODS.ROOT}/>
      <TestMethodForm />
    </div>
  )
}


