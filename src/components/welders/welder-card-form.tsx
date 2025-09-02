"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Plus, QrCode } from "lucide-react"
import Image from "next/image"
import { ROUTES } from "@/constants/routes"
import QRCode from "qrcode"

interface WelderVariable {
  id: string
  name: string
  actualValue: string
  rangeQualified: string
}


interface WelderCardData {
  id?: string
  welderImage: string | null
  company: string
  welderName: string
  iqamaId: string
  welderId: string
  cardNo: string
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
  authorisedBy: string
  weldingInspector: string
  certificationStatement: string
}

interface WelderCardFormProps {
  initialData?: WelderCardData
  onSubmit: (data: WelderCardData) => void
  onCancel: () => void
  readOnly?: boolean
}

export function WelderCardForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: WelderCardFormProps) {
  const [formData, setFormData] = useState<WelderCardData>({
    company: "",
    welderImage: null,
    welderName: "",
    iqamaId: "",
    welderId: "",
    cardNo: "",
    wpsNo: "",
    process: "",
    jointType: "",
    testPosition: "",
    positionQualified: "",
    verticalProgression: "",
    testThickness: "",
    testDia: "",
    thicknessQualified: "",
    pNoQualified: "",
    diameterQualified: "",
    fNoQualified: "",
    fillerMetalElectrodeClassUsed: "",
    placeOfIssue: "",
    testMethod: "",
    dateOfTest: "",
    dateOfExp: "",
    authorisedBy: "",
    weldingInspector: "",
    certificationStatement: "",
    ...initialData
  })

  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    // Generate QR code for existing forms (when we have an ID)
    if (formData.id && !readOnly) {
      const generateQR = async () => {
        try {
          const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_QUALIFICATION_PREVIEW(formData.id!)}`
          const dataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 120 })
          setQrSrc(dataUrl)
        } catch (error) {
          console.error("Failed to generate QR code:", error)
          setQrSrc(null)
        }
      }
      generateQR()
    }
  }, [formData.id, readOnly])

  const handleInputChange = (field: keyof WelderCardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        handleInputChange('welderImage', e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Certificate Header */}
      <div className="bg-background print:bg-white">
        {/* ATECO Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left - ATECO Logo and Info */}
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
                {formData.welderImage ? (
                  <Image
                    src={formData.welderImage}
                    alt="Welder"
                    width={128}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center print:bg-white">
                    {!readOnly ? (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Label htmlFor="imageUpload" className="cursor-pointer text-blue-600 hover:text-blue-500 text-xs">
                          Upload Photo
                        </Label>
                        <Input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No Photo</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="print:bg-white">
              {/* Row 1 */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Card No</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm print:text-black">{formData.cardNo}</span>
                  ) : (
                    <Input
                      value={formData.cardNo}
                      onChange={(e) => handleInputChange('cardNo', e.target.value)}
                      placeholder="Enter Card No"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Process</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm">{formData.wpsNo}</span>
                  ) : (
                    <Input
                      value={formData.wpsNo}
                      onChange={(e) => handleInputChange('wpsNo', e.target.value)}
                      placeholder="Enter WPS/PQR No"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 border ">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Position</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm">{formData.welderId}</span>
                  ) : (
                    <Input
                      type="date"
                      value={formData.welderId}
                      onChange={(e) => handleInputChange('welderId', e.target.value)}
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 border">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Vertical Progression</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm">{formData.jointType}</span>
                  ) : (
                    <Input
                      value={formData.jointType}
                      onChange={(e) => handleInputChange('jointType', e.target.value)}
                      placeholder="Enter Joint Type"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-2">
                <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Position</div>
                <div className="p-3 border">
                  {readOnly ? (
                    <span className="text-sm">{formData.testPosition}</span>
                  ) : (
                    <Input
                      type="date"
                      value={formData.testPosition}
                      onChange={(e) => handleInputChange('testPosition', e.target.value)}
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Authorization */}
          <div className="border grid grid-cols-2">
            <div>
              <div className="p-3 pb-0">
                {readOnly ? (
                  <span className="text-sm">{formData.authorisedBy}</span>
                ) : (
                  <Input
                    value={formData.authorisedBy}
                    onChange={(e) => handleInputChange('authorisedBy', e.target.value)}
                    placeholder="Enter Authorized By"
                    className="border-0 p-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-3 font-semibold text-sm">Authorized By</div>
            </div>

            <div>
              <div className="p-3 pb-0 text-right">
                {readOnly ? (
                  <span className="text-sm">{formData.weldingInspector}</span>
                ) : (
                  <Input
                    value={formData.weldingInspector}
                    onChange={(e) => handleInputChange('weldingInspector', e.target.value)}
                    placeholder="Enter Welding Inspector"
                    className="border-0 p-0 h-auto text-sm text-right"
                  />
                )}
              </div>
              <div className="p-3 font-semibold text-sm text-right">Welding Inspector</div>
            </div>
          </div>

          {/* Certification Statement */}
            <div className="border bg-background dark:bg-sidebar p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We, the undersigned, certify that the statements in the record are correct and that the test coupons were welded and tested in accordance with the requirements of{" "}
                {readOnly ? (
                  <span className="font-bold text-blue-600">{formData.certificationStatement}</span>
                ) : (
                  <Input
                    value={formData.certificationStatement}
                    onChange={(e) => handleInputChange('certificationStatement', e.target.value)}
                    placeholder="ASME SEC IX Ed(2023)"
                    className="border-0 p-0 h-auto text-sm inline-block w-48 text-center font-bold text-blue-600 bg-transparent"
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
                <span className="text-sm">{formData.cardNo}</span>
              ) : (
                <Input
                  value={formData.cardNo}
                  onChange={(e) => handleInputChange('cardNo', e.target.value)}
                  placeholder="Enter Card No"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">WPS/PQR No.</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.wpsNo}</span>
              ) : (
                <Input
                  value={formData.wpsNo}
                  onChange={(e) => handleInputChange('wpsNo', e.target.value)}
                  placeholder="Enter WPS/PQR No"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Process</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.process}</span>
              ) : (
                <Input
                  value={formData.process}
                  onChange={(e) => handleInputChange('process', e.target.value)}
                  placeholder="Enter Process"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Joint Type</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.jointType}</span>
              ) : (
                <Input
                  value={formData.jointType}
                  onChange={(e) => handleInputChange('jointType', e.target.value)}
                  placeholder="Enter Joint Type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 border ">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Position</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.positionQualified}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.positionQualified}
                  onChange={(e) => handleInputChange('positionQualified', e.target.value)}
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Position Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.positionQualified}</span>
              ) : (
                <Input
                  value={formData.positionQualified}
                  onChange={(e) => handleInputChange('positionQualified', e.target.value)}
                  placeholder="Enter Position Qualified"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Dia</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.testDia}</span>
              ) : (
                <Input
                  value={formData.testDia}
                  onChange={(e) => handleInputChange('testDia', e.target.value)}
                  placeholder="Enter Test Dia"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Thickness Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.thicknessQualified}</span>
              ) : (
                <Input
                  value={formData.thicknessQualified}
                  onChange={(e) => handleInputChange('thicknessQualified', e.target.value)}
                  placeholder="Enter Thickness Qualified"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Vertical Progression</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.verticalProgression}</span>
              ) : (
                <Input
                  value={formData.verticalProgression}
                  onChange={(e) => handleInputChange('verticalProgression', e.target.value)}
                  placeholder="Enter Vertical Progression"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Thickness</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.testThickness}</span>
              ) : (
                <Input
                  value={formData.testThickness}
                  onChange={(e) => handleInputChange('testThickness', e.target.value)}
                  placeholder="Enter Test Thickness"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">P No Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.pNoQualified}</span>
              ) : (
                <Input
                  value={formData.pNoQualified}
                  onChange={(e) => handleInputChange('pNoQualified', e.target.value)}
                  placeholder="Enter P No Qualified"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Diameter Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.diameterQualified}</span>
              ) : (
                <Input
                  value={formData.diameterQualified}
                  onChange={(e) => handleInputChange('diameterQualified', e.target.value)}
                  placeholder="Enter Diameter Qualified"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">F No Qualified</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.fNoQualified}</span>
              ) : (
                <Input
                  value={formData.fNoQualified}
                  onChange={(e) => handleInputChange('fNoQualified', e.target.value)}
                  placeholder="Enter F No Qualified"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Filler Metal/Electrode Class Used</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.fillerMetalElectrodeClassUsed}</span>
              ) : (
                <Input
                  value={formData.fillerMetalElectrodeClassUsed}
                  onChange={(e) => handleInputChange('fillerMetalElectrodeClassUsed', e.target.value)}
                  placeholder="Enter Filler Metal/Electrode Class Used"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-4 border">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Place of Issue</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.placeOfIssue}</span>
              ) : (
                <Input
                  value={formData.placeOfIssue}
                  onChange={(e) => handleInputChange('placeOfIssue', e.target.value)}
                  placeholder="Enter Place of Issue"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Test Method</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.testMethod}</span>
              ) : (
                <Input
                  value={formData.testMethod}
                  onChange={(e) => handleInputChange('testMethod', e.target.value)}
                  placeholder="Enter Test Method"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-4">
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Date of Test</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.dateOfTest}</span>
              ) : (
                <Input
                  value={formData.dateOfTest}
                  onChange={(e) => handleInputChange('dateOfTest', e.target.value)}
                  placeholder="Enter Date of Test"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-3 bg-background dark:bg-sidebar font-medium text-sm border print:!bg-white print:!text-black">Date of Exp	</div>
            <div className="p-3 border">
              {readOnly ? (
                <span className="text-sm">{formData.dateOfExp}</span>
              ) : (
                <Input
                  value={formData.dateOfExp}
                  onChange={(e) => handleInputChange('dateOfExp', e.target.value)}
                  placeholder="Enter Date of Exp"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>
        </div>
        {/* Statement */}
        <div className="mb-6">
          <div className="border  bg-background dark:bg-sidebar p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
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

export type { WelderCardData, WelderVariable }
