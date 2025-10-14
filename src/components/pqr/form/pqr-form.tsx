"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { useCreatePQR, useUpdatePQR } from "@/hooks/use-pqr"
import { useRouter } from "next/navigation"
import { DynamicColumn, DynamicRow } from "./dynamic-table"
import { HeaderInfoSection } from "./sections/header-info-section"
import { JointsSection } from "./sections/joints-section"
import { BaseMetalsSection } from "./sections/base-metals-section"
import { FillerMetalsSection } from "./sections/filler-metals-section"
import { PositionsPreheatSection } from "./sections/positions-preheat-section"
import { PWHTGasSection } from "./sections/pwht-gas-section"
import { ElectricalTechniquesSection } from "./sections/electrical-techniques-section"
import { WeldingParametersSection } from "./sections/welding-parameters-section"
import { TensileTestSection } from "./sections/tensile-test-section"
import { GuidedBendTestSection } from "./sections/guided-bend-test-section"
import { ToughnessTestSection } from "./sections/toughness-test-section"
import { FilletWeldTestSection } from "./sections/fillet-weld-test-section"
import { OtherTestsSection } from "./sections/other-tests-section"
import { WelderTestingInfoSection } from "./sections/welder-testing-info-section"
import { CertificationSection } from "./sections/certification-section"
import { SignatureSection } from "./sections/signature-section"

export interface PQRFormData {
    headerInfo?: { columns: DynamicColumn[]; data: DynamicRow[] }
    joints?: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string; designFiles?: File[] }
    baseMetals?: { columns: DynamicColumn[]; data: DynamicRow[] }
    fillerMetals?: { columns: DynamicColumn[]; data: DynamicRow[] }
    positions?: { columns: DynamicColumn[]; data: DynamicRow[] }
    preheat?: { columns: DynamicColumn[]; data: DynamicRow[] }
    pwht?: { columns: DynamicColumn[]; data: DynamicRow[] }
    gas?: { columns: DynamicColumn[]; data: DynamicRow[] }
    electrical?: { columns: DynamicColumn[]; data: DynamicRow[] }
    techniques?: { columns: DynamicColumn[]; data: DynamicRow[] }
    weldingParameters?: { columns: DynamicColumn[]; data: DynamicRow[] }
    tensileTest?: { columns: DynamicColumn[]; data: DynamicRow[] }
    guidedBendTest?: { columns: DynamicColumn[]; data: DynamicRow[] }
    toughnessTest?: { columns: DynamicColumn[]; data: DynamicRow[] }
    filletWeldTest?: { columns: DynamicColumn[]; data: DynamicRow[] }
    otherTests?: { columns: DynamicColumn[]; data: DynamicRow[] }
    welderTestingInfo?: { columns: DynamicColumn[]; data: DynamicRow[] }
    certification?: { columns?: DynamicColumn[]; data?: { id: string; reference: string }[] }
    signatures?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

interface PQRFormProps {
    isAsme?: boolean
    initialPqrData?: PQRFormData
    pqrId?: string
    onSubmit?: (data: PQRFormData) => void
}

export function PQRForm({
    isAsme = true,
    initialPqrData = {},
    pqrId,
    onSubmit,
}: PQRFormProps) {
    const [formData, setFormData] = useState<PQRFormData>(initialPqrData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const didInitFromProps = useRef(false)
    const hasInitialData = useRef(false)
    
    // Hooks for backend integration
    const createPQRMutation = useCreatePQR()
    const updatePQRMutation = useUpdatePQR()
    const router = useRouter()

    // Helper function to convert boolean to PQR type
    const getPQRType = (isAsme: boolean): 'API_1104' | 'ASME_SEC_IX' => {
        return isAsme ? 'ASME_SEC_IX' : 'API_1104'
    }

    // Initialize from props - handle both initial load and updates
    useEffect(() => {
        const hasAny = initialPqrData && Object.keys(initialPqrData).length > 0
        if (hasAny) {
            setFormData(initialPqrData)
            didInitFromProps.current = true
            hasInitialData.current = true
        }
    }, [initialPqrData])

    // Reset form when switching between ASME/API modes for new forms only
    // This only runs once when the component mounts or when explicitly switching form types
    useEffect(() => {
        // Skip if we're in edit mode or have loaded initial data
        if (pqrId || hasInitialData.current) {
            return
        }
        
        // Only reset if this is not the first render
        if (didInitFromProps.current) {
            setFormData({})
        }
    }, [isAsme, pqrId])

    const handleSectionUpdate = useCallback((sectionId: keyof PQRFormData, sectionData: PQRFormData[typeof sectionId]) => {
        setFormData((prevData) => ({
            ...prevData,
            [sectionId]: sectionData,
        }))
    }, [])

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (Object.keys(formData).length === 0 && !pqrId) {
            toast.error("Please fill in some data.")
            setIsSubmitting(false)
            return
        }

        try {
            // Helper function to transform dynamic table data to flat object
            const transformDynamicData = (sectionData: { columns?: DynamicColumn[]; data?: DynamicRow[] } | undefined): Record<string, string | number | boolean> => {
                if (!sectionData?.data || !Array.isArray(sectionData.data)) return {}
                
                const result: Record<string, string | number | boolean> = {}
                sectionData.data.forEach((row: DynamicRow) => {
                    // Support both 'label' and 'description' fields
                    const label = row.label || row.description
                    const value = row.value
                    if (label && value !== undefined && value !== null && value !== '') {
                        // Convert label to snake_case key
                        const key = String(label).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                        result[key] = value
                    }
                })
                return result
            }

            // Extract welder_card_id and other welder testing info
            let welderCardId = ""
            let mechanicalTestingConductedBy = ""
            let labTestNo = ""
            
            if (formData.welderTestingInfo?.data) {
                const welderCardIdRow = formData.welderTestingInfo.data.find(row => row.label === "Welder Card ID")
                const mechanicalTestingRow = formData.welderTestingInfo.data.find(row => row.label === "Mechanical Testing Conducted by")
                const labTestRow = formData.welderTestingInfo.data.find(row => row.label === "Lab Test No.")
                
                if (welderCardIdRow) {
                    welderCardId = welderCardIdRow.value as string || ""
                }
                if (mechanicalTestingRow) {
                    mechanicalTestingConductedBy = mechanicalTestingRow.value as string || ""
                }
                if (labTestRow) {
                    labTestNo = labTestRow.value as string || ""
                }
            }

            // Transform header info to basic_info structure
            const headerData = transformDynamicData(formData.headerInfo)
            const basicInfo = {
                pqr_number: String(headerData.pqr_no || ""),
                date_qualified: String(headerData.date_of_issue || ""),
                qualified_by: String(headerData.contractor_name || ""),
                approved_by: String(headerData.client_end_user || "")
            }

            // Transform form data to backend format
            const backendData = {
                // Transform header info to basic_info format
                basic_info: {
                    ...basicInfo,
                    ...transformDynamicData(formData.headerInfo)
                },
                
                // Transform dynamic sections to flat objects with correct field names
                joints: transformDynamicData(formData.joints),
                base_metals: transformDynamicData(formData.baseMetals),
                filler_metals: transformDynamicData(formData.fillerMetals),
                positions: transformDynamicData(formData.positions),
                preheat: transformDynamicData(formData.preheat),
                post_weld_heat_treatment: transformDynamicData(formData.pwht),
                gas: transformDynamicData(formData.gas),
                electrical_characteristics: transformDynamicData(formData.electrical),
                techniques: transformDynamicData(formData.techniques),
                welding_parameters: transformDynamicData(formData.weldingParameters),
                tensile_test: transformDynamicData(formData.tensileTest),
                guided_bend_test: transformDynamicData(formData.guidedBendTest),
                toughness_test: transformDynamicData(formData.toughnessTest),
                fillet_weld_test: transformDynamicData(formData.filletWeldTest),
                other_tests: transformDynamicData(formData.otherTests),
                signatures: transformDynamicData(formData.signatures),
                
                // Add specific fields at top level
                welder_card_id: String(welderCardId),
                mechanical_testing_conducted_by: String(mechanicalTestingConductedBy),
                lab_test_no: String(labTestNo),
                
                // Add certification data if available
                ...(formData.certification?.data?.[0] && {
                    law_name: String(formData.certification.data[0].reference || "")
                }),
                
                type: getPQRType(isAsme)
            }

            // Debug: Log the data being sent
            console.log("PQR Data being sent:", JSON.stringify(backendData, null, 2))
            console.log("Type field value:", backendData.type)
            console.log("isAsme value:", isAsme)
            console.log("getPQRType result:", getPQRType(isAsme))
            console.log("Type field in backendData:", backendData.type)

            // Validate that we have at least some data to send
            const hasData = Object.values(backendData).some(value => {
                if (typeof value === 'object' && value !== null) {
                    return Object.keys(value).length > 0
                }
                return value !== undefined && value !== null && value !== ''
            })

            if (!hasData) {
                toast.error("Please fill in at least some data before submitting.")
                setIsSubmitting(false)
                return
            }

            // Extract files from joints section
            const files = formData.joints?.designFiles || []

            if (pqrId) {
                // Update existing PQR
                await updatePQRMutation.mutateAsync({
                    id: pqrId,
                    data: backendData,
                    files: files
                })
                toast.success("PQR updated successfully!")
            } else {
                // Create new PQR
                console.log("Calling createPQRMutation with data:", backendData)
                console.log("Type in mutation data:", backendData.type)
                await createPQRMutation.mutateAsync({
                    data: backendData,
                    files: files
                })
                toast.success("PQR created successfully!")
            }

            // Redirect to PQRs list page
            router.push('/welders/pqr')

            // Call custom onSubmit if provided
            if (onSubmit) {
                onSubmit(formData)
            }
        } catch (error) {
            console.error("Failed to save PQR:", error)
            toast.error("Failed to save PQR. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Create memoized update handlers for each section
    const updateHeaderInfo = useCallback(
        (sectionData: NonNullable<PQRFormData["headerInfo"]>) => handleSectionUpdate("headerInfo", sectionData),
        [handleSectionUpdate]
    )
    const updateJoints = useCallback(
        (sectionData: NonNullable<PQRFormData["joints"]>) => handleSectionUpdate("joints", sectionData),
        [handleSectionUpdate]
    )
    const updateBaseMetals = useCallback(
        (sectionData: NonNullable<PQRFormData["baseMetals"]>) => handleSectionUpdate("baseMetals", sectionData),
        [handleSectionUpdate]
    )
    const updateFillerMetals = useCallback(
        (sectionData: NonNullable<PQRFormData["fillerMetals"]>) => handleSectionUpdate("fillerMetals", sectionData),
        [handleSectionUpdate]
    )
    const updatePositions = useCallback(
        (sectionData: NonNullable<PQRFormData["positions"]>) => handleSectionUpdate("positions", sectionData),
        [handleSectionUpdate]
    )
    const updatePreheat = useCallback(
        (sectionData: NonNullable<PQRFormData["preheat"]>) => handleSectionUpdate("preheat", sectionData),
        [handleSectionUpdate]
    )
    const updatePwht = useCallback(
        (sectionData: NonNullable<PQRFormData["pwht"]>) => handleSectionUpdate("pwht", sectionData),
        [handleSectionUpdate]
    )
    const updateGas = useCallback(
        (sectionData: NonNullable<PQRFormData["gas"]>) => handleSectionUpdate("gas", sectionData),
        [handleSectionUpdate]
    )
    const updateElectrical = useCallback(
        (sectionData: NonNullable<PQRFormData["electrical"]>) => handleSectionUpdate("electrical", sectionData),
        [handleSectionUpdate]
    )
    const updateTechniques = useCallback(
        (sectionData: NonNullable<PQRFormData["techniques"]>) => handleSectionUpdate("techniques", sectionData),
        [handleSectionUpdate]
    )
    const updateWeldingParameters = useCallback(
        (sectionData: NonNullable<PQRFormData["weldingParameters"]>) => handleSectionUpdate("weldingParameters", sectionData),
        [handleSectionUpdate]
    )
    const updateTensileTest = useCallback(
        (sectionData: NonNullable<PQRFormData["tensileTest"]>) => handleSectionUpdate("tensileTest", sectionData),
        [handleSectionUpdate]
    )
    const updateGuidedBendTest = useCallback(
        (sectionData: NonNullable<PQRFormData["guidedBendTest"]>) => handleSectionUpdate("guidedBendTest", sectionData),
        [handleSectionUpdate]
    )
    const updateToughnessTest = useCallback(
        (sectionData: NonNullable<PQRFormData["toughnessTest"]>) => handleSectionUpdate("toughnessTest", sectionData),
        [handleSectionUpdate]
    )
    const updateFilletWeldTest = useCallback(
        (sectionData: NonNullable<PQRFormData["filletWeldTest"]>) => handleSectionUpdate("filletWeldTest", sectionData),
        [handleSectionUpdate]
    )
    const updateOtherTests = useCallback(
        (sectionData: NonNullable<PQRFormData["otherTests"]>) => handleSectionUpdate("otherTests", sectionData),
        [handleSectionUpdate]
    )
    const updateWelderTestingInfo = useCallback(
        (sectionData: NonNullable<PQRFormData["welderTestingInfo"]>) => handleSectionUpdate("welderTestingInfo", sectionData),
        [handleSectionUpdate]
    )
    const updateCertification = useCallback(
        (sectionData: NonNullable<PQRFormData["certification"]>) => handleSectionUpdate("certification", sectionData),
        [handleSectionUpdate]
    )
    const updateSignatures = useCallback(
        (sectionData: NonNullable<PQRFormData["signatures"]>) => handleSectionUpdate("signatures", sectionData),
        [handleSectionUpdate]
    )

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4" key={isAsme ? "asme" : "api"}>
            <HeaderInfoSection
                key={`header-${isAsme}`}
                onUpdate={updateHeaderInfo}
                initialSectionData={formData.headerInfo}
            />
            <JointsSection
                key={`joints-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateJoints}
                initialSectionData={formData.joints}
                pqrId={pqrId}
            />
            <BaseMetalsSection
                key={`base-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateBaseMetals}
                initialSectionData={formData.baseMetals}
            />
            <FillerMetalsSection
                key={`filler-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateFillerMetals}
                initialSectionData={formData.fillerMetals}
            />
            <PositionsPreheatSection
                key={`pospre-${isAsme}`}
                isAsme={isAsme}
                updatePositions={updatePositions}
                updatePreheat={updatePreheat}
                initialSectionData={{
                    positions: formData.positions,
                    preheat: formData.preheat,
                }}
            />
            <PWHTGasSection
                key={`pwhtgas-${isAsme}`}
                isAsme={isAsme}
                updatePwht={updatePwht}
                updateGas={updateGas}
                initialSectionData={{ pwht: formData.pwht, gas: formData.gas }}
            />
            <ElectricalTechniquesSection
                key={`elec-${isAsme}`}
                isAsme={isAsme}
                updateElectrical={updateElectrical}
                updateTechniques={updateTechniques}
                initialSectionData={{
                    electrical: formData.electrical,
                    techniques: formData.techniques,
                }}
            />
            <WeldingParametersSection
                key={`wp-${isAsme}`}
                onUpdate={updateWeldingParameters}
                initialSectionData={formData.weldingParameters}
            />
            <TensileTestSection
                key={`tt-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateTensileTest}
                initialSectionData={formData.tensileTest}
            />
            <GuidedBendTestSection
                key={`gbt-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateGuidedBendTest}
                initialSectionData={formData.guidedBendTest}
            />
            <ToughnessTestSection
                key={`tough-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateToughnessTest}
                initialSectionData={formData.toughnessTest}
            />
            <FilletWeldTestSection
                key={`fwt-${isAsme}`}
                isAsme={isAsme}
                onUpdate={updateFilletWeldTest}
                initialSectionData={formData.filletWeldTest}
            />
            <OtherTestsSection
                key={`ot-${isAsme}`}
                onUpdate={updateOtherTests}
                initialSectionData={formData.otherTests}
            />
            <WelderTestingInfoSection
                key={`wti-${isAsme}`}
                onUpdate={updateWelderTestingInfo}
                initialSectionData={formData.welderTestingInfo}
            />
            <CertificationSection
                key={`cert-${isAsme}`}
                onUpdate={updateCertification}
                initialSectionData={formData.certification}
            />
            <SignatureSection
                key={`sig-${isAsme}`}
                onUpdate={updateSignatures}
                initialSectionData={formData.signatures}
            />

<div className="flex justify-end">

            <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting || createPQRMutation.isPending || updatePQRMutation.isPending}
            >
                {isSubmitting || createPQRMutation.isPending || updatePQRMutation.isPending
                    ? pqrId
                    ? "Updating..."
                    : "Submitting..."
                    : pqrId
                    ? "Update PQR Data"
                    : "Submit PQR Data"}
            </Button>
                    </div>

        </form>
    )
}
