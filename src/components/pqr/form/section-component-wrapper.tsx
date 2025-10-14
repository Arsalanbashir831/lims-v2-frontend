"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicTable, DynamicColumn, DynamicRow } from "./dynamic-table"
import { WelderSelector } from "@/components/common/welder-selector"
import { Welder } from "@/lib/schemas/welder"

interface WelderSelectorProps {
    selectedWelder?: Welder
    onWelderSelection: (welderId: string | undefined, welder: Welder | undefined) => void
    welderNameValue: string
    onWelderNameChange: (value: string) => void
    welderIdValue: string
    onWelderIdChange: (value: string) => void
}

interface SectionComponentWrapperProps {
    sectionId: string
    title: string
    qwEquivalent?: string
    isAsme?: boolean
    initialCols: DynamicColumn[]
    initialDataRows: DynamicRow[]
    onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
    isSectionTable?: boolean
    children?: React.ReactNode
    welderSelector?: WelderSelectorProps
}

export function SectionComponentWrapper({
    sectionId,
    title,
    qwEquivalent,
    isAsme = false,
    initialCols,
    initialDataRows,
    onUpdate,
    isSectionTable = true,
    children,
    welderSelector,
}: SectionComponentWrapperProps) {
    const [columns, setColumns] = useState<DynamicColumn[]>(initialCols)
    const [data, setData] = useState<DynamicRow[]>(initialDataRows)

    const didInitRef = useRef(false)
    const lastSnapshotRef = useRef<string>("")
    const lastPropsSnapshotRef = useRef<string>("")

    // Sync state with props when they change (e.g., when loading PQR data)
    useEffect(() => {
        const newPropsSnapshot = JSON.stringify({ columns: initialCols, data: initialDataRows })
        
        // Only update if the incoming props have changed
        if (newPropsSnapshot !== lastPropsSnapshotRef.current) {
            lastPropsSnapshotRef.current = newPropsSnapshot
            setColumns(initialCols)
            setData(initialDataRows)
        }
    }, [initialCols, initialDataRows])

    // Update parent when local state changes, but avoid initial echo and repeated identical emissions
    useEffect(() => {
        const snapshot = JSON.stringify({ columns, data })
        if (!didInitRef.current) {
            didInitRef.current = true
            lastSnapshotRef.current = snapshot
            return
        }
        if (snapshot === lastSnapshotRef.current) return
        lastSnapshotRef.current = snapshot
        onUpdate({ columns, data })
    }, [columns, data, onUpdate])

    const handleColumnsChange = useCallback((newColumns: DynamicColumn[]) => {
        setColumns(newColumns)
    }, [])

    const handleDataChange = useCallback((newData: DynamicRow[]) => {
        setData(newData)
    }, [])

    return (
        <Card className="pb-0 overflow-hidden">
            <CardHeader className="px-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">{title}{" "}
                            {
                                isAsme && qwEquivalent && (
                                    <span className=" ">
                                        ({qwEquivalent})
                                    </span>
                                )
                            }

                        </CardTitle>
                        {children && (
                            <p className="text-sm text-muted-foreground mt-1">{children}</p>
                        )}
                    </div>
                    {isAsme && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ASME Format
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DynamicTable
                    className="rounded-none"
                    initialColumns={columns}
                    initialData={data}
                    onColumnsChange={handleColumnsChange}
                    onDataChange={handleDataChange}
                    allowAddRow={isSectionTable}
                    allowAddColumn={isSectionTable}
                    allowDeleteColumn={isSectionTable}
                    welderSelector={welderSelector}
                />
            </CardContent>
        </Card>
    )
}
