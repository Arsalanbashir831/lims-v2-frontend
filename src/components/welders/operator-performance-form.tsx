/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Plus, QrCode, Trash2 } from "lucide-react"
import Image from "next/image"
import { ROUTES } from "@/constants/routes"
import QRCode from "qrcode"
import { Checkbox } from "../ui/checkbox"
import { ConfirmPopover } from "../ui/confirm-popover"

interface WelderVariable {
    id: string
    name: string
    actualValue: string
    rangeQualified: string
}

interface TestConducted {
    id: string
    testType: string
    reportNo: string
    results: string
    testPerformed: boolean
}

interface OperatorPerformanceData {
    id?: string
    operatorImage: string | null
    operatorName: string
    operatorIdNo: string
    wpsFollowed: string
    jointWeldType: string
    baseMetalSpec: string
    fillerSpec: string
    testCouponSize: string
    certificateRefNo: string
    iqamaId: string
    dateOfIssued: string
    dateOfWelding: string
    baseMetalPNumber: string
    fillerClass: string
    positions: string
    automaticWeldingEquipmentVariables: WelderVariable[]
    machineWeldingEquipmentVariables: WelderVariable[]
    testsConducted: TestConducted[]
    certificationStatement: string
    testingWitnessed: string
    testSupervisor: string
}

interface OperatorPerformanceFormProps {
    initialData?: OperatorPerformanceData
    onSubmit: (data: OperatorPerformanceData) => void
    onCancel: () => void
    readOnly?: boolean
}

const defaultAutomaticWeldingEquipmentVariables: WelderVariable[] = [
    { id: "1", name: "Type of Welding (Automatic)", actualValue: "", rangeQualified: "" },
    { id: "2", name: "Welding Process", actualValue: "", rangeQualified: "" },
    { id: "3", name: "Filler Metal Used (Yes or No) (EBW or LBW)", actualValue: "", rangeQualified: "" },
    { id: "4", name: "Type of Laser for LBW (CO2 to YAG, etc.)", actualValue: "", rangeQualified: "" },
    { id: "5", name: "Countinous Drive or Inertia Welding (FW)", actualValue: "", rangeQualified: "" },
    { id: "6", name: "Vacuum or Out of Vacuum (EBW)", actualValue: "", rangeQualified: "" },
]

const defaultMachineWeldingEquipmentVariables: WelderVariable[] = [
    { id: "1", name: "Type of Welding (Machine)", actualValue: "", rangeQualified: "" },
    { id: "2", name: "Welding Process", actualValue: "", rangeQualified: "" },
    { id: "3", name: "Direct or Remote Visual Control", actualValue: "", rangeQualified: "" },
    { id: "4", name: "Automatic Arc Voltage Control (GTAW)", actualValue: "", rangeQualified: "" },
    { id: "5", name: "Automatic Joint Tracking", actualValue: "", rangeQualified: "" },
    { id: "6", name: "Position(s)", actualValue: "", rangeQualified: "" },
    { id: "7", name: "Base Material Thickness", actualValue: "", rangeQualified: "" },
    { id: "8", name: "Consumable Insert (GTAW or PAW)", actualValue: "", rangeQualified: "" },
    { id: "9", name: "Backing (With or Without)", actualValue: "", rangeQualified: "" },
    { id: "10", name: "Single or Multiple Passes Per Side", actualValue: "", rangeQualified: "" },
]


const defaultTestsConducted: TestConducted[] = [
    { id: "1", testType: "Visual Inspection", reportNo: "", results: "", testPerformed: false },
    { id: "2", testType: "Liquid Penetrant Examination (PT)", reportNo: "", results: "", testPerformed: false },
    { id: "3", testType: "Ultrasonic Testig (UT)", reportNo: "", results: "", testPerformed: false },
    { id: "3", testType: "Bend Test", reportNo: "", results: "", testPerformed: false },
]

export function OperatorPerformanceForm({
    initialData,
    onSubmit,
    onCancel,
    readOnly = false
}: OperatorPerformanceFormProps) {
    const createInitialFormData = (): OperatorPerformanceData => ({
        operatorName: "",
        operatorImage: null,
        operatorIdNo: "",
        wpsFollowed: "",
        jointWeldType: "",
        baseMetalSpec: "",
        fillerSpec: "",
        testCouponSize: "",
        certificateRefNo: "",
        iqamaId: "",
        dateOfIssued: "",
        dateOfWelding: "",
        baseMetalPNumber: "",
        fillerClass: "",
        positions: "",
        automaticWeldingEquipmentVariables: JSON.parse(JSON.stringify(defaultAutomaticWeldingEquipmentVariables)),
        machineWeldingEquipmentVariables: JSON.parse(JSON.stringify(defaultMachineWeldingEquipmentVariables)),
        testsConducted: JSON.parse(JSON.stringify(defaultTestsConducted)),
        certificationStatement: "",
        testingWitnessed: "",
        testSupervisor: "",
        ...initialData
    })

    const [formData, setFormData] = useState<OperatorPerformanceData>(createInitialFormData())
    const [originalFormData, setOriginalFormData] = useState<OperatorPerformanceData>(createInitialFormData())
    const [qrSrc, setQrSrc] = useState<string | null>(null)

    useEffect(() => {
        // Update both form data and original data when initialData changes
        const updatedData = createInitialFormData()
        setFormData(updatedData)
        setOriginalFormData(updatedData)
    }, [initialData])

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

    const handleInputChange = (field: keyof OperatorPerformanceData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                handleInputChange('operatorImage', e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const addAutomaticWeldingEquipmentVariable = () => {
        const newId = (formData.automaticWeldingEquipmentVariables.length + 1).toString()
        const newVariable: WelderVariable = { id: newId, name: "", actualValue: "", rangeQualified: "" }
        handleInputChange('automaticWeldingEquipmentVariables', [...formData.automaticWeldingEquipmentVariables, newVariable])
    }

    const removeAutomaticWeldingEquipmentVariable = (id: string) => {
        handleInputChange('automaticWeldingEquipmentVariables', formData.automaticWeldingEquipmentVariables.filter(variable => variable.id !== id))
    }

    const addMachineWeldingEquipmentVariable = () => {
        const newId = (formData.machineWeldingEquipmentVariables.length + 1).toString()
        const newVariable: WelderVariable = { id: newId, name: "", actualValue: "", rangeQualified: "" }
        handleInputChange('machineWeldingEquipmentVariables', [...formData.machineWeldingEquipmentVariables, newVariable])
    }

    const removeMachineWeldingEquipmentVariable = (id: string) => {
        handleInputChange('machineWeldingEquipmentVariables', formData.machineWeldingEquipmentVariables.filter(variable => variable.id !== id))
    }

    const updateAutomaticWeldingEquipmentVariable = (id: string, field: keyof WelderVariable, value: string) => {
        const updatedVariables = formData.automaticWeldingEquipmentVariables.map(variable =>
            variable.id === id ? { ...variable, [field]: value } : variable
        )
        handleInputChange('automaticWeldingEquipmentVariables', updatedVariables)
    }

    const updateMachineWeldingEquipmentVariable = (id: string, field: keyof WelderVariable, value: string) => {
        const updatedVariables = formData.machineWeldingEquipmentVariables.map(variable =>
            variable.id === id ? { ...variable, [field]: value } : variable
        )
        handleInputChange('machineWeldingEquipmentVariables', updatedVariables)
    }

    const updateTestConducted = (id: string, field: keyof TestConducted, value: string | boolean) => {
        const updatedTests = formData.testsConducted.map(test =>
            test.id === id ? { ...test, [field]: value } : test
        )
        handleInputChange('testsConducted', updatedTests)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const revertToOriginal = () => {
        setFormData(JSON.parse(JSON.stringify(originalFormData)))
    }

    const handleCancel = () => {
        revertToOriginal()
        onCancel()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certificate Header */}
            <div className="bg-background print:bg-white">
                {/* ATECO Header */}
                <div className="flex justify-between items-start mb-6">
                    {/* Left - ATECO Logo and Info */}
                    <div className="flex-1">
                        <Image src="/gripco-logo.webp" alt="Gripco" width={100} height={80} className="object-contain h-20 w-auto" />
                    </div>

                    {/* Center - Title */}
                    <div className="flex-1 text-center">
                        <h2 className="text-xl font-bold text-green-700 mb-2">
                            Welder / Welder operator performance Qualification Record
                        </h2>
                        {readOnly ? (
                            <h3 className="text-lg font-bold">
                                {formData.operatorName || "OPERATOR NAME"}
                            </h3>
                        ) : (
                            <Input
                                value={formData.operatorName}
                                onChange={(e) => handleInputChange('operatorName', e.target.value)}
                                placeholder="Enter operator name"
                                className="border-0 p-0 h-auto text-sm text-center !text-lg font-bold"
                            />
                        )}
                    </div>

                    {/* Right - Welder Photo */}
                    <div className="flex-1 flex justify-end">
                        <div className="w-40 h-24 border-2  overflow-hidden bg-gray-100 dark:bg-sidebar">
                            {formData.operatorImage ? (
                                <Image
                                    src={formData.operatorImage}
                                    alt="Welder"
                                    width={128}
                                    height={160}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
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
                </div>

                {/* Basic Information Table */}
                <div className="border mb-6">
                    <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">Welding Operator Data & Test Description</div>
                    {/* Row 1 */}
                    <div className="grid grid-cols-4 border-b ">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Operator Name</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.operatorName}</span>
                            ) : (
                                <Input
                                    value={formData.operatorName}
                                    onChange={(e) => handleInputChange('operatorName', e.target.value)}
                                    placeholder="Enter welder name"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Certificate No</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.certificateRefNo}</span>
                            ) : (
                                <Input
                                    value={formData.certificateRefNo}
                                    onChange={(e) => handleInputChange('certificateRefNo', e.target.value)}
                                    placeholder="Enter Iqama/ID number"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-4 border-b">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Operator ID / Symbol</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.operatorIdNo}</span>
                            ) : (
                                <Input
                                    value={formData.operatorIdNo}
                                    onChange={(e) => handleInputChange('operatorIdNo', e.target.value)}
                                    placeholder="Enter welder ID number"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Iqama / Passport</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.iqamaId}</span>
                            ) : (
                                <Input
                                    value={formData.iqamaId}
                                    onChange={(e) => handleInputChange('iqamaId', e.target.value)}
                                    placeholder="Enter certificate reference number"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-4 border-b ">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">WPS Followed</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.wpsFollowed}</span>
                            ) : (
                                <Input
                                    type="date"
                                    value={formData.wpsFollowed}
                                    onChange={(e) => handleInputChange('wpsFollowed', e.target.value)}
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Date of Issue</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.dateOfIssued}</span>
                            ) : (
                                <Input
                                    value={formData.dateOfIssued}
                                    onChange={(e) => handleInputChange('dateOfIssued', e.target.value)}
                                    placeholder="Enter WPS/PQR identification"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-4">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Joint / Weld Type</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.jointWeldType}</span>
                            ) : (
                                <Input
                                    value={formData.jointWeldType}
                                    onChange={(e) => handleInputChange('jointWeldType', e.target.value)}
                                    placeholder="Enter qualification standard"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Date of Welding</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.dateOfWelding}</span>
                            ) : (
                                <Input
                                    value={formData.dateOfWelding}
                                    onChange={(e) => handleInputChange('dateOfWelding', e.target.value)}
                                    placeholder="Enter base metal specification"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-4 border-t ">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Base Metal Spec.</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.baseMetalSpec}</span>
                            ) : (
                                <Input
                                    value={formData.baseMetalSpec}
                                    onChange={(e) => handleInputChange('baseMetalSpec', e.target.value)}
                                    placeholder="Enter joint type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Base Metal P-No.</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.baseMetalPNumber}</span>
                            ) : (
                                <Input
                                    value={formData.baseMetalPNumber}
                                    onChange={(e) => handleInputChange('baseMetalPNumber', e.target.value)}
                                    placeholder="Enter weld type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 6 */}
                    <div className="grid grid-cols-4 border-t ">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Filler (SFA) Spec.</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.fillerSpec}</span>
                            ) : (
                                <Input
                                    value={formData.fillerSpec}
                                    onChange={(e) => handleInputChange('fillerSpec', e.target.value)}
                                    placeholder="Enter joint type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Filler Class. (AWS)</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.fillerClass}</span>
                            ) : (
                                <Input
                                    value={formData.fillerClass}
                                    onChange={(e) => handleInputChange('fillerClass', e.target.value)}
                                    placeholder="Enter weld type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 7 */}
                    <div className="grid grid-cols-4 border-t ">
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Test Coupon Size</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.testCouponSize}</span>
                            ) : (
                                <Input
                                    value={formData.testCouponSize}
                                    onChange={(e) => handleInputChange('testCouponSize', e.target.value)}
                                    placeholder="Enter joint type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                        <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">Position(s)</div>
                        <div className="p-1 border-x">
                            {readOnly ? (
                                <span className="text-sm">{formData.positions}</span>
                            ) : (
                                <Input
                                    value={formData.positions}
                                    onChange={(e) => handleInputChange('positions', e.target.value)}
                                    placeholder="Enter weld type"
                                    className="border-0 p-0 h-auto text-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Automatic Welding Equipment Variables Table */}
                <div className="border">
                    <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">Testing Variables and Qualification Limits</div>
                    <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">Testing Variables and Qualification Limits When Using Automatic Welding Equipment</div>

                    <div className="grid grid-cols-3 border-b  bg-background dark:bg-sidebar">
                        <div className="p-1 font-medium text-sm border-r">Welder variables</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Actual Values</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Range Qualified</div>
                    </div>

                    {formData.automaticWeldingEquipmentVariables.map((variable, index) => (
                        <div key={variable.id} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-background dark:bg-sidebar'}`}>
                            <div className="p-1 border-r ">
                                {readOnly ? (
                                    <span className="text-sm">{variable.name}</span>
                                ) : (
                                    <Input
                                        value={variable.name}
                                        onChange={(e) => updateAutomaticWeldingEquipmentVariable(variable.id, 'name', e.target.value)}
                                        placeholder="Enter variable name"
                                        className="border-0 p-0 h-auto text-sm"
                                    />
                                )}
                            </div>
                            <div className="p-1 border-r ">
                                {readOnly ? (
                                    <span className="text-sm">{variable.actualValue}</span>
                                ) : (
                                    <Input
                                        value={variable.actualValue}
                                        onChange={(e) => updateAutomaticWeldingEquipmentVariable(variable.id, 'actualValue', e.target.value)}
                                        placeholder="Actual value"
                                        className="border-0 p-0 h-auto text-sm"
                                    />
                                )}
                            </div>
                            <div className="p-1 flex items-center gap-2">
                                {readOnly ? (
                                    <span className="text-sm flex-1">{variable.rangeQualified}</span>
                                ) : (
                                    <>
                                        <Input
                                            value={variable.rangeQualified}
                                            onChange={(e) => updateAutomaticWeldingEquipmentVariable(variable.id, 'rangeQualified', e.target.value)}
                                            placeholder="Range qualified"
                                            className="border-0 p-0 h-auto text-sm flex-1"
                                        />
                                        <ConfirmPopover
                                            trigger={
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-7 w-7 p-0 shrink-0"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            }
                                            title="Confirm Deletion"
                                            description="Are you sure you want to delete this automatic welding equipment variable?"
                                            onConfirm={() => removeAutomaticWeldingEquipmentVariable(variable.id)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {!readOnly && (
                        <div className="p-1 border-t ">
                            <Button type="button" variant="outline" size="sm" onClick={addAutomaticWeldingEquipmentVariable}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Welder Variable
                            </Button>
                        </div>
                    )}
                </div>

                {/* Machine Welding Equipment Variables Table */}
                <div className="border mb-6">
                    <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">Testing Variables and Qualification Limits When Using Machine Welding Equipment</div>

                    <div className="grid grid-cols-3 border-b  bg-background dark:bg-sidebar">
                        <div className="p-1 font-medium text-sm border-r">Welder variables</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Actual Values</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Range Qualified</div>
                    </div>

                    {formData.machineWeldingEquipmentVariables.map((variable, index) => (
                        <div key={variable.id} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-background dark:bg-sidebar'}`}>
                            <div className="p-1 border-r ">
                                {readOnly ? (
                                    <span className="text-sm">{variable.name}</span>
                                ) : (
                                    <Input
                                        value={variable.name}
                                        onChange={(e) => updateMachineWeldingEquipmentVariable(variable.id, 'name', e.target.value)}
                                        placeholder="Enter variable name"
                                        className="border-0 p-0 h-auto text-sm"
                                    />
                                )}
                            </div>
                            <div className="p-1 border-r ">
                                {readOnly ? (
                                    <span className="text-sm">{variable.actualValue}</span>
                                ) : (
                                    <Input
                                        value={variable.actualValue}
                                        onChange={(e) => updateMachineWeldingEquipmentVariable(variable.id, 'actualValue', e.target.value)}
                                        placeholder="Actual value"
                                        className="border-0 p-0 h-auto text-sm"
                                    />
                                )}
                            </div>
                            <div className="p-1 flex items-center gap-2">
                                {readOnly ? (
                                    <span className="text-sm flex-1">{variable.rangeQualified}</span>
                                ) : (
                                    <>
                                        <Input
                                            value={variable.rangeQualified}
                                            onChange={(e) => updateMachineWeldingEquipmentVariable(variable.id, 'rangeQualified', e.target.value)}
                                            placeholder="Range qualified"
                                            className="border-0 p-0 h-auto text-sm flex-1"
                                        />
                                        <ConfirmPopover
                                            trigger={
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-7 w-7 p-0 shrink-0"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            }
                                            title="Confirm Deletion"
                                            description="Are you sure you want to delete this machine welding equipment variable?"
                                            onConfirm={() => removeMachineWeldingEquipmentVariable(variable.id)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {!readOnly && (
                        <div className="p-1 border-t ">
                            <Button type="button" variant="outline" size="sm" onClick={addAutomaticWeldingEquipmentVariable}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Welder Variable
                            </Button>
                        </div>
                    )}
                </div>

                {/* Test Conducted Table */}
                <div className="border mb-6 text-center">
                    <div className="grid grid-cols-4 border-b  bg-background dark:bg-sidebar">
                        <div className="p-1 font-medium text-sm border-r">Test Conducted/ Type of Test</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Test Performed</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Results</div>
                        <div className="p-1 font-medium text-sm text-center border-r">Report No</div>
                    </div>

                    {formData.testsConducted.map((test, index) => (
                        <div key={test.id} className={`grid grid-cols-4 ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-background dark:bg-sidebar'}`}>
                            <div className="p-1 border-r ">
                                <span className="text-sm">{test.testType}</span>
                            </div>
                            <div className="p-1 border-r">
                                {readOnly ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Checkbox checked={test.testPerformed} disabled className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Checkbox
                                            checked={test.testPerformed}
                                            onCheckedChange={(checked) => updateTestConducted(test.id, 'testPerformed', checked)}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="p-1 border-r ">
                                {readOnly ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm">{test.testPerformed ? "N/A" : test.reportNo}</span>
                                    </div>
                                ) : (
                                       <Input
                                            value={test.reportNo}
                                            onChange={(e) => updateTestConducted(test.id, 'reportNo', e.target.value)}
                                            placeholder="Enter report number"
                                            className="border-0 p-0 h-auto text-sm flex-1 text-center"
                                        />
                                )}
                            </div>
                            <div className="p-1">
                                {readOnly ? (
                                    <span className="text-sm text-center">{test.results}</span>
                                ) : (
                                    <Input
                                        value={test.results}
                                        onChange={(e) => updateTestConducted(test.id, 'results', e.target.value)}
                                        placeholder="Enter results"
                                        className="border-0 p-0 h-auto text-sm text-center"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Certification Statement */}
                <div className="mb-6">
                    <div className="border  bg-background dark:bg-sidebar p-4">
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

                {/* Signatures Section */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                    {/* Left Side - ATECO Details */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">GRIPCO LIMS</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold mb-2 text-sm">Testing Witnessed / Welder Inspector</p>
                                <div className="underline text-right">
                                    {readOnly ? (
                                        <p className="text-sm font-medium">{formData.testingWitnessed}</p>
                                    ) : (
                                        <Input
                                            value={formData.testingWitnessed}
                                            onChange={(e) => handleInputChange('testingWitnessed', e.target.value)}
                                            placeholder="Enter inspector name"
                                            className="border-0 p-0 h-auto text-sm font-medium text-right"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="font-semibold mb-2 text-sm">Test Supervisor / Technical Manager</p>
                                <div className="underline text-right">
                                    {readOnly ? (
                                        <p className="text-sm font-medium">{formData.testSupervisor}</p>
                                    ) : (
                                        <Input
                                            value={formData.testSupervisor}
                                            onChange={(e) => handleInputChange('testSupervisor', e.target.value)}
                                            placeholder="Enter supervisor name"
                                            className="border-0 p-0 h-auto text-sm font-medium text-right"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Client Details and QR Code */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm mb-2 text-sm">Client Name:</p>
                            <p className="text-sm font-medium underline">{formData.operatorName}</p>
                        </div>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm mb-2 text-sm">Client Signature:</p>
                            <div className="border-b-2 border-gray-400 pb-1 min-w-32"></div>
                        </div>

                        {/* QR Code Verification Area */}
                        <div className="bg-gray-200 dark:bg-sidebar p-4 relative">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs">
                                        To verify the information about the certificate. Please scan the QR code using any QR scan app
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-white dark:bg-sidebar flex items-center justify-center">
                                    {formData.id && qrSrc ? (
                                        <Image
                                            src={qrSrc}
                                            alt="QR Code"
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <QrCode className="w-16 h-16" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-black text-white p-4 text-center text-xs">
                    <p>Address: 3658 Ar Rabiyah District Unit No:02, P.0 Box 32437 Dammam 6621 KSA</p>
                    <p>Tel: +966138383130 | Website: www.atecosaudia.com</p>
                    <p>Email: info@atecosaudia.com | Cr# 2051226809</p>
                </div>
            </div>

            {/* Actions */}
            {!readOnly && (
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update Certificate' : 'Create Certificate'}
                    </Button>
                </div>
            )}
        </form>
    )
}

export type { OperatorPerformanceData, WelderVariable, TestConducted }
