import { CalibrationTestingForm } from "@/components/calibration-testing/form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewCalibrationTestingPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Calibration Testing" description="Create a new calibration testing" label={null} href={ROUTES.APP.CALIBRATION_TESTING.ROOT}/>
      <CalibrationTestingForm />
    </div>
  )
}


