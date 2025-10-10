/* eslint-disable no-console, @typescript-eslint/no-explicit-any */


"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
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
    joints?: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string }
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
    certification?: { columns: DynamicColumn[]; data: DynamicRow[] }
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

    // Initialize from props only once to avoid loops when children call onUpdate
    useEffect(() => {
        if (didInitFromProps.current) return
        const hasAny = initialPqrData && Object.keys(initialPqrData).length > 0
        if (hasAny) {
            setFormData(initialPqrData)
        }
        didInitFromProps.current = true
    }, [initialPqrData])

    // When the form type changes, reset the form so sections reinitialize with correct templates
    useEffect(() => {
        setFormData({})
    }, [isAsme])

    const handleSectionUpdate = useCallback((sectionId: keyof PQRFormData, sectionData: any) => {
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
            if (onSubmit) {
                onSubmit(formData)
            } else {
                toast.success(pqrId ? "Updated!" : "Saved!")
            }
        } catch (error) {
            toast.error("Failed to save PQR Form data.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Create memoized update handlers for each section
    const updateHeaderInfo = useCallback(
        (sectionData: any) => handleSectionUpdate("headerInfo", sectionData),
        [handleSectionUpdate]
    )
    const updateJoints = useCallback(
        (sectionData: any) => handleSectionUpdate("joints", sectionData),
        [handleSectionUpdate]
    )
    const updateBaseMetals = useCallback(
        (sectionData: any) => handleSectionUpdate("baseMetals", sectionData),
        [handleSectionUpdate]
    )
    const updateFillerMetals = useCallback(
        (sectionData: any) => handleSectionUpdate("fillerMetals", sectionData),
        [handleSectionUpdate]
    )
    const updatePositions = useCallback(
        (sectionData: any) => handleSectionUpdate("positions", sectionData),
        [handleSectionUpdate]
    )
    const updatePreheat = useCallback(
        (sectionData: any) => handleSectionUpdate("preheat", sectionData),
        [handleSectionUpdate]
    )
    const updatePwht = useCallback(
        (sectionData: any) => handleSectionUpdate("pwht", sectionData),
        [handleSectionUpdate]
    )
    const updateGas = useCallback(
        (sectionData: any) => handleSectionUpdate("gas", sectionData),
        [handleSectionUpdate]
    )
    const updateElectrical = useCallback(
        (sectionData: any) => handleSectionUpdate("electrical", sectionData),
        [handleSectionUpdate]
    )
    const updateTechniques = useCallback(
        (sectionData: any) => handleSectionUpdate("techniques", sectionData),
        [handleSectionUpdate]
    )
    const updateWeldingParameters = useCallback(
        (sectionData: any) => handleSectionUpdate("weldingParameters", sectionData),
        [handleSectionUpdate]
    )
    const updateTensileTest = useCallback(
        (sectionData: any) => handleSectionUpdate("tensileTest", sectionData),
        [handleSectionUpdate]
    )
    const updateGuidedBendTest = useCallback(
        (sectionData: any) => handleSectionUpdate("guidedBendTest", sectionData),
        [handleSectionUpdate]
    )
    const updateToughnessTest = useCallback(
        (sectionData: any) => handleSectionUpdate("toughnessTest", sectionData),
        [handleSectionUpdate]
    )
    const updateFilletWeldTest = useCallback(
        (sectionData: any) => handleSectionUpdate("filletWeldTest", sectionData),
        [handleSectionUpdate]
    )
    const updateOtherTests = useCallback(
        (sectionData: any) => handleSectionUpdate("otherTests", sectionData),
        [handleSectionUpdate]
    )
    const updateWelderTestingInfo = useCallback(
        (sectionData: any) => handleSectionUpdate("welderTestingInfo", sectionData),
        [handleSectionUpdate]
    )
    const updateCertification = useCallback(
        (sectionData: any) => handleSectionUpdate("certification", sectionData),
        [handleSectionUpdate]
    )
    const updateSignatures = useCallback(
        (sectionData: any) => handleSectionUpdate("signatures", sectionData),
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
            />
            <SignatureSection
                key={`sig-${isAsme}`}
                onUpdate={updateSignatures}
                initialSectionData={formData.signatures}
            />

<div className="flex justify-end">

            <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting
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
