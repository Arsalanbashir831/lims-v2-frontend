"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"

export type TestingReportRow = {
  welderId: string
  welderName: string
  iqamaNumber: string
  testCouponId: string
  dateOfInspection: string
  weldingProcesses: string
  weldingType: string
  backing: string
  weldJointType: string
  thicknessProductType: string
  pipeDiameter: string
  baseMetalPNumber: string
  fillerMetalSpecSfa: string
  fillerMetalFNumber: string
  fillerMetalAdditionDeletion: string
  depositThicknessEachProcess: string
  weldingPositions: string
  verticalProgressions: string
  fuelGasTypeOfw: string
  inertGasBacking: string
  transferMode: string
  currentTypePolarity: string
  voltage: string
  current: string
  travelSpeed: string
  interPassTemperature: string
  preHeat: string
  postWeldHeatTreatment: string
  resultStatus: string
}

export type TestingReportFormData = {
  rows: TestingReportRow[]
  preparedBy: string
  projectDetails: string
  contractDetails: string
  client: string
}

type Props = {
  initialData?: Partial<TestingReportFormData>
  onSubmit?: (data: TestingReportFormData) => void
  readOnly?: boolean
}

const defaultRow: TestingReportRow = {
  welderId: "",
  welderName: "",
  iqamaNumber: "",
  testCouponId: "",
  dateOfInspection: "",
  weldingProcesses: "",
  weldingType: "",
  backing: "",
  weldJointType: "",
  thicknessProductType: "",
  pipeDiameter: "",
  baseMetalPNumber: "",
  fillerMetalSpecSfa: "",
  fillerMetalFNumber: "",
  fillerMetalAdditionDeletion: "",
  depositThicknessEachProcess: "",
  weldingPositions: "",
  verticalProgressions: "",
  fuelGasTypeOfw: "",
  inertGasBacking: "",
  transferMode: "",
  currentTypePolarity: "",
  voltage: "",
  current: "",
  travelSpeed: "",
  interPassTemperature: "",
  preHeat: "",
  postWeldHeatTreatment: "",
  resultStatus: "",
}

export function TestingReportForm({ initialData, onSubmit, readOnly = false }: Props) {
  const [formData, setFormData] = useState<TestingReportFormData>({
    rows: initialData?.rows && initialData.rows.length > 0 ? initialData.rows : [structuredClone(defaultRow)],
    preparedBy: initialData?.preparedBy ?? "",
    projectDetails: initialData?.projectDetails ?? "",
    contractDetails: initialData?.contractDetails ?? "",
    client: initialData?.client ?? "",
  })

  const columns = useMemo(
    () => [
      { key: "welderId", label: "Welder ID" },
      { key: "welderName", label: "Welder Name" },
      { key: "iqamaNumber", label: "Iqama Number" },
      { key: "testCouponId", label: "Test Coupon ID" },
      { key: "dateOfInspection", label: "Date of Inspection", type: "date" as const },
      { key: "weldingProcesses", label: "Welding Process(es)" },
      { key: "weldingType", label: "Type of welding (manual/ semi-auto)" },
      { key: "backing", label: "Backing (with /without)" },
      { key: "weldJointType", label: "Type of Weld/Joint" },
      { key: "thicknessProductType", label: "Thickness / Product Type (Plate or Pipe)" },
      { key: "pipeDiameter", label: "Diameter of Pipe" },
      { key: "baseMetalPNumber", label: "Base Metal P Number" },
      { key: "fillerMetalSpecSfa", label: "Filler Metal or electrode specification(s) (SFA)" },
      { key: "fillerMetalFNumber", label: "Filler Metal F-Number (S)" },
      { key: "fillerMetalAdditionDeletion", label: "Filler Metal addition/Deletion ( GTAW / PAW)" },
      { key: "depositThicknessEachProcess", label: "Deposit thickness for each process" },
      { key: "weldingPositions", label: "Welding Position (s)" },
      { key: "verticalProgressions", label: "Vertical Progression (s)" },
      { key: "fuelGasTypeOfw", label: "Type of Fuel Gas (OFW)" },
      { key: "inertGasBacking", label: "Inert gas backing (GTAW, PAW, GMAW)" },
      { key: "transferMode", label: "Transfer Mode (spray, globular, or pulse to sort circuit-GMAW)" },
      { key: "currentTypePolarity", label: "Current Type I Polarity (AC. DCEP, DCEN)" },
      { key: "voltage", label: "Voltage" },
      { key: "current", label: "Current" },
      { key: "travelSpeed", label: "Travel Speed" },
      { key: "interPassTemperature", label: "InterPass Temperature" },
      { key: "preHeat", label: "Pre Heat (If Applicable)" },
      { key: "postWeldHeatTreatment", label: "Post Weld Heat Treatment (If Applicable)" },
      { key: "resultStatus", label: "Result Status" },
    ] as Array<{ key: keyof TestingReportRow; label: string; type?: "date" }>,
    []
  )

  const setCell = (rowIndex: number, key: keyof TestingReportRow, value: string) => {
    setFormData(prev => {
      const next = { ...prev, rows: [...prev.rows] }
      next.rows[rowIndex] = { ...next.rows[rowIndex], [key]: value }
      return next
    })
  }

  const insertRow = (index: number) => {
    setFormData(prev => {
      const nextRows = [...prev.rows]
      nextRows.splice(index, 0, structuredClone(defaultRow))
      return { ...prev, rows: nextRows }
    })
  }

  const removeRow = (index: number) => {
    setFormData(prev => {
      const nextRows = [...prev.rows]
      nextRows.splice(index, 1)
      return { ...prev, rows: nextRows.length > 0 ? nextRows : [structuredClone(defaultRow)] }
    })
  }

  const appendRow = () => insertRow(formData.rows.length)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Add rows as needed. You can insert above/below or delete any row.</p>
            {!readOnly && (
              <Button type="button" size="sm" onClick={appendRow}>
                <Plus className="w-4 h-4 mr-1" /> Add row
              </Button>
            )}
          </div>

          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    <TableHead key={col.key as string} className="min-w-[220px] align-top">{col.label}</TableHead>
                  ))}
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.rows.map((row, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    {columns.map(col => (
                      <TableCell key={`${rowIndex}-${col.key as string}`}>                        
                        {col.type === "date" ? (
                          <Input
                            type="date"
                            value={(row as any)[col.key] as string}
                            onChange={e => setCell(rowIndex, col.key as keyof TestingReportRow, e.target.value)}
                            disabled={readOnly}
                          />
                        ) : (
                          <Input
                            value={(row as any)[col.key] as string}
                            onChange={e => setCell(rowIndex, col.key as keyof TestingReportRow, e.target.value)}
                            disabled={readOnly}
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <>
                            <Button type="button" variant="outline" size="icon" onClick={() => insertRow(rowIndex)}>
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => insertRow(rowIndex + 1)}>
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeRow(rowIndex)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparedBy">Prepared By</Label>
              <Input
                id="preparedBy"
                value={formData.preparedBy}
                onChange={e => setFormData(prev => ({ ...prev, preparedBy: e.target.value }))}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={e => setFormData(prev => ({ ...prev, client: e.target.value }))}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDetails">Project Details</Label>
            <Textarea
              id="projectDetails"
              value={formData.projectDetails}
              onChange={e => setFormData(prev => ({ ...prev, projectDetails: e.target.value }))}
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractDetails">Contract Details</Label>
            <Textarea
              id="contractDetails"
              value={formData.contractDetails}
              onChange={e => setFormData(prev => ({ ...prev, contractDetails: e.target.value }))}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>
      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      )}
    </form>
  )
}

export default TestingReportForm


