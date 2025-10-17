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
    joints?: { columns?: DynamicColumn[]; data?: DynamicRow[]; designPhotoUrl?: string; designFiles?: File[] }
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
            // Helper function to transform dynamic table data to clean array/object format
            const transformDynamicData = (sectionData: { columns?: DynamicColumn[]; data?: DynamicRow[] } | undefined, sectionName = ''): any => {
                console.log(`\n🔍 Transforming section: ${sectionName}`)
                console.log('Input data:', sectionData)
                
                if (!sectionData?.data || !Array.isArray(sectionData.data)) {
                    console.log(`⚠️ No data found for ${sectionName}`)
                    return {}
                }
                
                console.log(`✅ ${sectionName} has ${sectionData.data.length} rows`)
                console.log(`✅ ${sectionName} has ${sectionData.columns?.length} columns`)
                
                // Check if this is a label-value table or a multi-column table
                // Label-value tables have ONLY 2 columns: (label/description) and value
                const hasLabelColumn = sectionData.columns?.some(col => 
                    col.accessorKey === 'label' || col.accessorKey === 'description'
                )
                const hasValueColumn = sectionData.columns?.some(col => 
                    col.accessorKey === 'value'
                )
                const columnCount = sectionData.columns?.filter(col => col.accessorKey !== 'id').length || 0
                
                // It's a label-value table ONLY if it has exactly 2 columns (label/description + value)
                const isLabelValueTable = hasLabelColumn && hasValueColumn && columnCount === 2
                
                console.log(`📋 ${sectionName} is ${isLabelValueTable ? 'label-value' : 'multi-column'} table (${columnCount} columns)`)
                
                if (isLabelValueTable) {
                    // Handle label-value tables (e.g., PWHT, Preheat, etc.)
                    // Return as array of [label, value] arrays
                    const rows = sectionData.data
                        .map((row: DynamicRow) => {
                            // Support both 'label' and 'description' fields
                            const label = row.label || row.description
                            const value = row.value
                            // Only include rows that have a label (keep even if value is empty)
                            if (label) {
                                return [String(label), value ?? ""]
                            }
                            return null
                        })
                        .filter(row => row !== null)
                    
                    return { rows }
                } else {
                    // Handle multi-column tables (e.g., GAS, Tensile Test, Signature, etc.)
                    console.log(`🔧 Multi-column transformation for ${sectionName}`)
                    const result: any = {}
                    
                    // Store ALL column headers metadata (including user-added columns)
                    if (sectionData.columns && sectionData.columns.length > 0) {
                        result.columns = sectionData.columns
                            .filter(col => col.accessorKey !== 'id') // Exclude 'id' column
                            .map(col => ({
                                key: col.accessorKey,
                                header: col.header
                            }))
                        console.log(`  📊 Transformed columns (${result.columns.length}):`, result.columns.map((c: any) => c.header))
                    }
                    
                    // Store rows as array of objects - include ALL data from dynamically added columns
                    result.rows = sectionData.data
                        .filter((row: DynamicRow) => !(row as any).hidden)
                        .map((row: DynamicRow, idx: number) => {
                            const rowData: Record<string, any> = {}
                            
                            console.log(`    🔸 Row ${idx} RAW:`, JSON.stringify(row, null, 2))
                            
                            // Include ALL keys from the row (including user-added columns)
                            Object.entries(row).forEach(([key, value]) => {
                                // Only exclude 'id' and 'hidden' keys
                                if (key !== 'id' && key !== 'hidden') {
                                    // Include value even if empty string (user might have added column but not filled it yet)
                                    if (value !== undefined && value !== null) {
                                        rowData[key] = value
                                    }
                                }
                            })
                            
                            console.log(`    ➡️ Transformed row ${idx}:`, rowData)
                            return rowData
                        })
                        .filter(row => {
                            // Only filter out completely empty rows (all values are empty)
                            const values = Object.values(row)
                            const hasData = values.length > 0 && values.some(val => val !== '' && val !== null && val !== undefined)
                            if (!hasData) {
                                console.log(`    ❌ Filtering out empty row`)
                            }
                            return hasData
                        })
                    
                    console.log(`  ✅ Final rows count: ${result.rows.length}`)
                    
                    // Only return if we have data
                    if (!result.rows || result.rows.length === 0) {
                        console.log(`  ⚠️ No rows found, returning empty`)
                        return {}
                    }
                    
                    console.log(`  🎉 Final result for ${sectionName}:`, result)
                    return result
                }
            }

            // Extract welder_id (database ID) and other welder testing info
            let welderId = ""
            let mechanicalTestingConductedBy = ""
            let labTestNo = ""
            
            if (formData.welderTestingInfo?.data) {
                const welderDatabaseIdRow = formData.welderTestingInfo.data.find(row => row.label === "Welder Database ID")
                const mechanicalTestingRow = formData.welderTestingInfo.data.find(row => row.label === "Mechanical Testing Conducted by")
                const labTestRow = formData.welderTestingInfo.data.find(row => row.label === "Lab Test No.")
                
                if (welderDatabaseIdRow) {
                    welderId = welderDatabaseIdRow.value as string || ""
                }
                if (mechanicalTestingRow) {
                    mechanicalTestingConductedBy = mechanicalTestingRow.value as string || ""
                }
                if (labTestRow) {
                    labTestNo = labTestRow.value as string || ""
                }
            }

            // Extract specific values from header info for basic_info
            const extractHeaderValue = (labelText: string): string => {
                if (!formData.headerInfo?.data) return "";
                const row = formData.headerInfo.data.find((r: DynamicRow) => 
                    (r.label || r.description) === labelText
                );
                return row ? String(row.value || "") : "";
            };
            
            const basicInfo = {
                pqr_number: extractHeaderValue("PQR No."),
                date_qualified: extractHeaderValue("Date of Issue"),
                qualified_by: extractHeaderValue("Contractor Name"),
                approved_by: extractHeaderValue("Client/End User")
            }

            // Transform form data to backend format
            const backendData = {
                // Transform header info to basic_info format
                basic_info: {
                    ...basicInfo,
                    ...transformDynamicData(formData.headerInfo, 'headerInfo')
                },
                
                // Transform dynamic sections to flat objects with correct field names
                joints: transformDynamicData(formData.joints, 'joints'),
                base_metals: transformDynamicData(formData.baseMetals, 'base_metals'),
                filler_metals: transformDynamicData(formData.fillerMetals, 'filler_metals'),
                positions: transformDynamicData(formData.positions, 'positions'),
                preheat: transformDynamicData(formData.preheat, 'preheat'),
                post_weld_heat_treatment: transformDynamicData(formData.pwht, 'pwht'),
                gas: transformDynamicData(formData.gas, 'GAS'),
                electrical_characteristics: transformDynamicData(formData.electrical, 'electrical'),
                techniques: transformDynamicData(formData.techniques, 'techniques'),
                welding_parameters: transformDynamicData(formData.weldingParameters, 'welding_parameters'),
                tensile_test: transformDynamicData(formData.tensileTest, 'TENSILE_TEST'),
                guided_bend_test: transformDynamicData(formData.guidedBendTest, 'GUIDED_BEND_TEST'),
                toughness_test: transformDynamicData(formData.toughnessTest, 'TOUGHNESS_TEST'),
                fillet_weld_test: transformDynamicData(formData.filletWeldTest, 'FILLET_WELD_TEST'),
                other_tests: transformDynamicData(formData.otherTests, 'OTHER_TESTS'),
                signatures: transformDynamicData(formData.signatures, 'SIGNATURES'),
                
                // Add specific fields at top level
                welder_id: String(welderId), // Required field
                ...(mechanicalTestingConductedBy && { mechanical_testing_conducted_by: String(mechanicalTestingConductedBy) }),
                ...(labTestNo && { lab_test_no: String(labTestNo) }),
                
                // Add certification data if available
                ...(formData.certification?.data?.[0]?.reference && {
                    law_name: String(formData.certification.data[0].reference)
                }),
                
                type: getPQRType(isAsme)
            }

            // Log final payload
            console.log('\n' + '='.repeat(60))
            console.log('📦 FINAL BACKEND PAYLOAD:')
            console.log(JSON.stringify(backendData, null, 2))
            console.log('='.repeat(60) + '\n')

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
