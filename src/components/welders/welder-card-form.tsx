/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Plus, QrCode } from "lucide-react"
import Image from "next/image"
import { ROUTES } from "@/constants/routes"
import QRCode from "qrcode"
import { WelderCard } from "@/lib/schemas/welder"
import { WelderSelector } from "@/components/common/welder-selector"

interface WelderVariable {
  id: string
  name: string
  actualValue: string
  rangeQualified: string
}


interface WelderCardFormData {
  id?: string
  company: string
  welder_id: string
  authorized_by: string
  welding_inspector: string
  law_name: string
  card_no: string
  // Welder information fields
  welder_name: string
  iqama_no: string
  operator_id: string
  welder_image: string
  // Attributes fields (mapped to attributes JSON)
  wpsNo: string
  process: string
  jointType: string
  testPosition: string
  positionQualified: string
  verticalProgression: string
  testThickness: string
  testDia: string
  thicknessQualified: string
  pNoQualified: string
  diameterQualified: string
  fNoQualified: string
  fillerMetalElectrodeClassUsed: string
  placeOfIssue: string
  testMethod: string
  dateOfTest: string
  dateOfExp: string
}

interface WelderCardFormProps {
  initialData?: WelderCard
  onSubmit: (data: {
    id?: string
    company: string
    welder_id: string
    authorized_by: string
    welding_inspector: string
    law_name: string
    card_no: string
    attributes: Record<string, unknown>
  }) => void
  onCancel: () => void
  readOnly?: boolean
}

export function WelderCardForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: WelderCardFormProps) {
  const createInitialFormData = (): WelderCardFormData => {
    const attributes = initialData?.attributes as Record<string, unknown> || {}
    return {
      id: initialData?.id,
      company: initialData?.company || "",
      welder_id: initialData?.welder_id || "",
      authorized_by: initialData?.authorized_by || "",
      welding_inspector: initialData?.welding_inspector || "",
      law_name: initialData?.law_name || "",
      card_no: initialData?.card_no || "",
      // Welder information fields
      welder_name: initialData?.welder_info?.operator_name || "",
      iqama_no: initialData?.welder_info?.iqama || "",
      operator_id: initialData?.welder_info?.operator_id || "",
      welder_image: initialData?.welder_info?.profile_image || "",
      // Map attributes fields
      wpsNo: String(attributes.wps_no || ""),
      process: String(attributes.process || ""),
      jointType: String(attributes.joint_type || ""),
      testPosition: String(attributes.test_position || ""),
      positionQualified: String(attributes.position_qualified || ""),
      verticalProgression: String(attributes.vertical_progression || ""),
      testThickness: String(attributes.test_thickness || ""),
      testDia: String(attributes.test_dia || ""),
      thicknessQualified: String(attributes.thickness_qualified || ""),
      pNoQualified: String(attributes.p_no_qualified || ""),
      diameterQualified: String(attributes.diameter_qualified || ""),
      fNoQualified: String(attributes.f_no_qualified || ""),
      fillerMetalElectrodeClassUsed: String(attributes.filler_metal_electrode_class_used || ""),
      placeOfIssue: String(attributes.place_of_issue || ""),
      testMethod: String(attributes.test_method || ""),
      dateOfTest: String(attributes.date_of_test || ""),
      dateOfExp: String(attributes.date_of_exp || ""),
    }
  }

  const [formData, setFormData] = useState<WelderCardFormData>(createInitialFormData())

  const [qrSrc, setQrSrc] = useState<string | null>(null)

  // Update form data when initialData changes
  useEffect(() => {
    const updatedData = createInitialFormData()
    setFormData(updatedData)
  }, [initialData])

  useEffect(() => {
    // Generate QR code for existing forms (when we have an ID)
    if (formData.id) {
      const generateQR = async () => {
        try {
          const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_CARDS_PREVIEW(formData.id!)}`
          const dataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 120 })
          setQrSrc(dataUrl)
        } catch (error) {
          console.error("Failed to generate QR code:", error)
          setQrSrc(null)
        }
      }
      generateQR()
    }
  }, [formData.id])

  const handleInputChange = (field: keyof WelderCardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWelderSelect = (welderId: string | undefined, welder: any) => {
    setFormData(prev => ({
      ...prev,
      welder_id: welderId || "",
      welder_name: String(welder?.operator_name || ""),
      iqama_no: String(welder?.iqama || ""),
      operator_id: String(welder?.operator_id || ""),
      welder_image: String(welder?.profile_image_url || "")
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Map form data to API structure with attributes
    // Only send welder_id to backend, not welder details
    const apiData = {
      id: formData.id,
      company: formData.company,
      welder_id: formData.welder_id, // Only send the welder ID
      authorized_by: formData.authorized_by,
      welding_inspector: formData.welding_inspector,
      law_name: formData.law_name,
      card_no: formData.card_no,
      // Map all form fields to attributes JSON
      attributes: {
        wps_no: formData.wpsNo,
        process: formData.process,
        joint_type: formData.jointType,
        test_position: formData.testPosition,
        position_qualified: formData.positionQualified,
        vertical_progression: formData.verticalProgression,
        test_thickness: formData.testThickness,
        test_dia: formData.testDia,
        thickness_qualified: formData.thicknessQualified,
        p_no_qualified: formData.pNoQualified,
        diameter_qualified: formData.diameterQualified,
        f_no_qualified: formData.fNoQualified,
        filler_metal_electrode_class_used: formData.fillerMetalElectrodeClassUsed,
        place_of_issue: formData.placeOfIssue,
        test_method: formData.testMethod,
        date_of_test: formData.dateOfTest,
        date_of_exp: formData.dateOfExp,
      }
    }

    onSubmit(apiData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Certificate Header */}
      <div className="bg-background print:bg-white">
        {/* ATECO Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left - Gripco Logo Image */}
          <div className="flex-1">
            <Image src="/gripco-logo.webp" alt="Gripco" width={100} height={80} className="object-contain h-16 w-auto" />
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-green-700">
              Welder Qualification Card
            </h2>
          </div>

          {/* Right - QR Code */}
          <div className="flex-1 flex justify-end">
            <div className="w-20 h-20 border overflow-hidden bg-gray-100 dark:bg-sidebar print:bg-white">
              {qrSrc ? (
                <Image src={qrSrc} alt="QR Code" width={128} height={160} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <QrCode className="w-full h-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welder Information */}
        <div className="border mb-8">
          <div className=" grid grid-cols-[1fr_2fr]">
            {/* Image */}
            <div className="flex-1 flex justify-end">
              <div className="w-full h-full border-2 overflow-hidden bg-gray-100 dark:bg-sidebar print:bg-white">
                <div className="w-full h-full flex items-center justify-center print:bg-white relative">
                  {formData.welder_id ? (
                    <div className="">
                      {formData.welder_image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${formData.welder_image.replace(/\\/g, '/')}`}
                          alt={formData.welder_name || "Welder"}
                          fill
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 text-xs print:!text-black">No Photo</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="">
                      <span className="text-gray-500 text-xs print:!text-black">Select Welder</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="print:bg-white">
              {/* Row 1 */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Company</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm print:!text-black">{formData.company}</span>
                  ) : (
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter Company"
                      className="border-0 py-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 2 - Welder Selection */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Welder</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm print:!text-black">{formData.welder_name}</span>
                  ) : (
                    <WelderSelector
                      value={formData.welder_id}
                      onValueChange={handleWelderSelect}
                      placeholder="Select a welder..."
                      disabled={readOnly}
                      className="border-0 py-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 3 - Iqama No (Read-only) */}
              <div className="grid grid-cols-2 border ">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Iqama No.</div>
                <div className="p-3 border">
                  <span className="text-sm white print:!text-black">{formData.iqama_no || "Select a welder first"}</span>
                </div>
              </div>

              {/* Row 4 - Welder ID (Read-only) */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Welder ID</div>
                <div className="p-3 border">
                  <span className="text-sm text-white print:!text-black">{formData.operator_id || "Select a welder first"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authorization */}
          <div className="border grid grid-cols-2">
            <div>
              <div className="p-3 pb-0">
                {readOnly ? (
                  <span className="text-sm print:text-black">{formData.authorized_by}</span>
                ) : (
                  <Input
                    value={formData.authorized_by}
                    onChange={(e) => handleInputChange('authorized_by', e.target.value)}
                    placeholder="Enter Authorized By"
                    className="border-0 py-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-3 font-semibold text-sm print:!text-black">Authorized By</div>
            </div>

            <div>
              <div className="p-3 pb-0 text-right">
                {readOnly ? (
                  <span className="text-sm print:!text-black">{formData.welding_inspector}</span>
                ) : (
                  <Input
                    value={formData.welding_inspector}
                    onChange={(e) => handleInputChange('welding_inspector', e.target.value)}
                    placeholder="Enter Welding Inspector"
                    className="border-0 py-0 h-auto text-sm text-right"
                  />
                )}
              </div>
              <div className="p-3 font-semibold text-sm text-right print:!text-black">Welding Inspector</div>
            </div>
          </div>

          {/* Certification Statement */}
          <div className="border bg-background dark:bg-sidebar p-4 print:!bg-gray-200">
            <p className="text-sm text-gray-700 dark:text-gray-300 print:!text-black ">
              This is to certify that this person has been tested in accordance with requirements of{" "}
              {readOnly ? (
                <span className="font-bold text-blue-600 print:text-black">{formData.law_name}</span>
              ) : (
                <Input
                  value={formData.law_name}
                  onChange={(e) => handleInputChange('law_name', e.target.value)}
                  placeholder="ASME SEC IX Ed(2023)"
                  className="border-0 py-0 h-auto text-xs inline-block w-32 text-center font- placeholder:text-blue-300 text-blue-600 bg-transparent"
                />
              )}
            </p>
          </div>
        </div>

        {/* Certificate Information */}
        <div className="border">
          {/* Row 1 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Card No</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.card_no}</span>
              ) : (
                <Input
                  value={formData.card_no}
                  onChange={(e) => handleInputChange('card_no', e.target.value)}
                  placeholder="Enter Card No"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">WPS/PQR No.</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.wpsNo}</span>
              ) : (
                <Input
                  value={formData.wpsNo}
                  onChange={(e) => handleInputChange('wpsNo', e.target.value)}
                  placeholder="Enter WPS/PQR No"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Process</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.process}</span>
              ) : (
                <Input
                  value={formData.process}
                  onChange={(e) => handleInputChange('process', e.target.value)}
                  placeholder="Enter Process"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Joint Type</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.jointType}</span>
              ) : (
                <Input
                  value={formData.jointType}
                  onChange={(e) => handleInputChange('jointType', e.target.value)}
                  placeholder="Enter Joint Type"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 border ">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Position</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.positionQualified}</span>
              ) : (
                <Input
                  value={formData.positionQualified}
                  placeholder="Enter Test Position"
                  onChange={(e) => handleInputChange('positionQualified', e.target.value)}
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Position Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.positionQualified}</span>
              ) : (
                <Input
                  value={formData.positionQualified}
                  onChange={(e) => handleInputChange('positionQualified', e.target.value)}
                  placeholder="Enter Position Qualified"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Dia</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.testDia}</span>
              ) : (
                <Input
                  value={formData.testDia}
                  onChange={(e) => handleInputChange('testDia', e.target.value)}
                  placeholder="Enter Test Dia"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Thickness Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.thicknessQualified}</span>
              ) : (
                <Input
                  value={formData.thicknessQualified}
                  onChange={(e) => handleInputChange('thicknessQualified', e.target.value)}
                  placeholder="Enter Thickness Qualified"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Vertical Progression</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.verticalProgression}</span>
              ) : (
                <Input
                  value={formData.verticalProgression}
                  onChange={(e) => handleInputChange('verticalProgression', e.target.value)}
                  placeholder="Enter Vertical Progression"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Thickness</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.testThickness}</span>
              ) : (
                <Input
                  value={formData.testThickness}
                  onChange={(e) => handleInputChange('testThickness', e.target.value)}
                  placeholder="Enter Test Thickness"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">P No Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.pNoQualified}</span>
              ) : (
                <Input
                  value={formData.pNoQualified}
                  onChange={(e) => handleInputChange('pNoQualified', e.target.value)}
                  placeholder="Enter P No Qualified"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Diameter Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.diameterQualified}</span>
              ) : (
                <Input
                  value={formData.diameterQualified}
                  onChange={(e) => handleInputChange('diameterQualified', e.target.value)}
                  placeholder="Enter Diameter Qualified"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">F No Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.fNoQualified}</span>
              ) : (
                <Input
                  value={formData.fNoQualified}
                  onChange={(e) => handleInputChange('fNoQualified', e.target.value)}
                  placeholder="Enter F No Qualified"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Filler Metal/Electrode Class Used</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.fillerMetalElectrodeClassUsed}</span>
              ) : (
                <Input
                  value={formData.fillerMetalElectrodeClassUsed}
                  onChange={(e) => handleInputChange('fillerMetalElectrodeClassUsed', e.target.value)}
                  placeholder="Enter Filler Metal/Electrode Class Used"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Place of Issue</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.placeOfIssue}</span>
              ) : (
                <Input
                  value={formData.placeOfIssue}
                  onChange={(e) => handleInputChange('placeOfIssue', e.target.value)}
                  placeholder="Enter Place of Issue"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Method</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.testMethod}</span>
              ) : (
                <Input
                  value={formData.testMethod}
                  onChange={(e) => handleInputChange('testMethod', e.target.value)}
                  placeholder="Enter Test Method"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-4">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Date of Test</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.dateOfTest}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.dateOfTest}
                  onChange={(e) => handleInputChange('dateOfTest', e.target.value)}
                  placeholder="Enter Date of Test"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Date of Exp	</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm print:text-black">{formData.dateOfExp}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.dateOfExp}
                  onChange={(e) => handleInputChange('dateOfExp', e.target.value)}
                  placeholder="Enter Date of Exp"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>
        </div>
        {/* Statement */}
        <div className="mb-6">
          <div className="border  bg-background dark:bg-sidebar print:!bg-gray-200 p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 print:!text-black ">
              This card, on its own qualifies the welder for 6 months from the Date of test. Beyond this date, welding continuity records shall be consulted to ensure the welder's qualification has been maintained.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {
        !readOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update Certificate' : 'Create Certificate'}
            </Button>
          </div>
        )
      }
    </form >
  )
}

export type { WelderCard, WelderVariable }
