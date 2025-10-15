import { EquipmentForm } from "@/components/equipments/form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewEquipmentPage() {
  return (
    <div className="grid gap-4">
      <FormHeader title="New Equipment" description="Create a new equipment" label={null} href={ROUTES.APP.LAB_EQUIPMENTS.ROOT}/>
      <EquipmentForm />
    </div>
  )
}


