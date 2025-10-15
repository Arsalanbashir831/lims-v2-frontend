/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Plus,
  QrCode,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import QRCode from "qrcode";
import { Checkbox } from "../ui/checkbox";
import { ConfirmPopover } from "../ui/confirm-popover";
import { useWelderCards } from "@/hooks/use-welder-cards";
import {
  CreateWelderCertificateData,
  WelderCertificateTest,
} from "@/lib/schemas/welder";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WelderVariable {
  id: string;
  name: string;
  actualValue: string;
  rangeQualified: string;
}

interface TestConducted {
  id: string;
  testType: string;
  reportNo: string;
  results: string;
  isReportChecked: boolean;
}

interface WelderQualificationData {
  id?: string;
  welderCardId: string;
  clientName: string;
  welderImage: string | null;
  welderName: string;
  wpsIdentification: string;
  iqamaId: string;
  qualificationStandard: string;
  baseMetalSpec: string;
  weldType: string;
  welderIdNo: string;
  jointType: string;
  dateOfTest: string;
  certificateRefNo: string;
  welderVariables: WelderVariable[];
  testsConducted: TestConducted[];
  certificationStatement: string;
  testingWitnessed: string;
  testSupervisor: string;
}

interface WelderQualificationFormProps {
  initialData?: WelderQualificationData | Record<string, unknown>; // Allow API data structure
  onSubmit: (data: CreateWelderCertificateData) => void;
  onCancel: () => void;
  readOnly?: boolean;
  onImageLoad?: () => void;
}

const defaultWelderVariables: WelderVariable[] = [
  { id: "1", name: "Welder Process(es)", actualValue: "", rangeQualified: "" },
  {
    id: "2",
    name: "Types of Welder (manual/semi auto)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "3",
    name: "Backing (With/without)",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "4", name: "Types of weld", actualValue: "", rangeQualified: "" },
  {
    id: "5",
    name: "Product Types(Plate or Pipe)",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "6", name: "Diameter of Pipe", actualValue: "", rangeQualified: "" },
  {
    id: "7",
    name: "Base Metal P Number to P Number",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "8",
    name: "Filler Metal or electrode specification",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "9",
    name: "Filler Meta F-Number(S)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "10",
    name: "Filer Metal addition/Deletion (GTAW/PAW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "11",
    name: "Consumable Insert (GTAW or PAW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "12",
    name: "Deposit thickness for each process",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "13", name: "Welder position", actualValue: "", rangeQualified: "" },
  {
    id: "14",
    name: "Vertical Progression",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "15",
    name: "Type of Fuel Gas(OFW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "16",
    name: "Insert gas backing(GTAW,PAW,GMAW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "17",
    name: "Transfer Mode( spary, globular, SHORT)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "18",
    name: "Current Type/Polarity(AC,DCEP,DCEN)",
    actualValue: "",
    rangeQualified: "",
  },
];

const defaultTestsConducted: TestConducted[] = [
  {
    id: "1",
    testType: "Visual Inspection",
    reportNo: "",
    results: "",
    isReportChecked: false,
  },
  {
    id: "2",
    testType: "NDT",
    reportNo: "",
    results: "",
    isReportChecked: false,
  },
  {
    id: "3",
    testType: "Mechanical Test",
    reportNo: "",
    results: "",
    isReportChecked: false,
  },
];

export function WelderQualificationForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
  onImageLoad,
}: WelderQualificationFormProps) {
  // Get welder cards for the selector
  const { data: welderCardsData } = useWelderCards(1, "", 100);
  const mapApiDataToFormData = (apiData: Record<string, unknown>): WelderQualificationData => {
    if (!apiData) return createInitialFormData();

    // Map testing variables from API to form structure
    const welderVariables = (
      (apiData.testing_variables_and_qualification_limits as Array<Record<string, unknown>>) || []
    ).map((item: Record<string, unknown>, index: number) => ({
      id: (index + 1).toString(),
      name: item.name || "",
      actualValue: item.actual_values || "",
      rangeQualified: item.range_values || "",
    }));

    // Map tests from API to form structure
    const testsConducted = ((apiData.tests as Array<Record<string, unknown>>) || []).map(
      (test: Record<string, unknown>, index: number) => ({
        id: (index + 1).toString(),
        testType: test.type || "",
        reportNo: test.report_no || "",
        results: test.results || "",
        isReportChecked: test.test_performed || false,
      })
    );

    return {
      id: apiData.id,
      welderCardId: apiData.welder_card_id || "", // Set from API
      clientName: apiData.welder_card_info?.company || "", // Get from welder_card_info
      welderImage: apiData.welder_card_info?.welder_info?.profile_image || null, // Get from nested welder_info
      welderName: apiData.welder_card_info?.welder_info?.operator_name || "", // Get from nested welder_info
      wpsIdentification: apiData.identification_of_wps_pqr || "",
      iqamaId: apiData.welder_card_info?.welder_info?.iqama || "", // Get from nested welder_info
      qualificationStandard: apiData.qualification_standard || "",
      baseMetalSpec: apiData.base_metal_specification || "",
      weldType: apiData.weld_type || "",
      welderIdNo: apiData.welder_card_info?.welder_info?.operator_id || "", // Get from nested welder_info
      jointType: apiData.joint_type || "",
      dateOfTest: apiData.date_of_test || "",
      certificateRefNo: apiData.welder_card_info?.card_no || "", // Get from welder_card_info
      welderVariables:
        welderVariables.length > 0
          ? welderVariables
          : JSON.parse(JSON.stringify(defaultWelderVariables)),
      testsConducted:
        testsConducted.length > 0
          ? testsConducted
          : JSON.parse(JSON.stringify(defaultTestsConducted)),
      certificationStatement: apiData.law_name || "",
      testingWitnessed: apiData.witnessed_by || "",
      testSupervisor: apiData.tested_by || "",
    };
  };

  const createInitialFormData = (): WelderQualificationData => ({
    welderCardId: "",
    clientName: "",
    welderImage: null,
    welderName: "",
    wpsIdentification: "",
    iqamaId: "",
    qualificationStandard: "",
    baseMetalSpec: "",
    weldType: "",
    welderIdNo: "",
    jointType: "",
    dateOfTest: "",
    certificateRefNo: "",
    welderVariables: JSON.parse(JSON.stringify(defaultWelderVariables)),
    testsConducted: JSON.parse(JSON.stringify(defaultTestsConducted)),
    certificationStatement: "",
    testingWitnessed: "",
    testSupervisor: "",
    ...initialData,
  });

  const [formData, setFormData] = useState<WelderQualificationData>(() =>
    initialData ? mapApiDataToFormData(initialData) : createInitialFormData()
  );
  const [originalFormData, setOriginalFormData] =
    useState<WelderQualificationData>(() =>
      initialData ? mapApiDataToFormData(initialData) : createInitialFormData()
    );
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [selectedWelderCardId, setSelectedWelderCardId] = useState<
    string | undefined
  >(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Update both form data and original data when initialData changes
    if (initialData) {
      const mappedData = mapApiDataToFormData(initialData);
      setFormData(mappedData);
      setOriginalFormData(mappedData);
    } else {
      const updatedData = createInitialFormData();
      setFormData(updatedData);
      setOriginalFormData(updatedData);
    }
  }, [initialData]);

  useEffect(() => {
    // Generate QR code for existing forms (when we have an ID)
    if (formData.id) {
      const generateQR = async () => {
        try {
          const frontendBase =
            typeof window !== "undefined" ? window.location.origin : "";
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_QUALIFICATION_PREVIEW(
            formData.id!
          )}`;
          const dataUrl = await QRCode.toDataURL(publicUrl, {
            margin: 1,
            width: 120,
          });
          setQrSrc(dataUrl);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
          setQrSrc(null);
        }
      };
      generateQR();
    }
  }, [formData.id]);

  const handleInputChange = (
    field: keyof WelderQualificationData,
    value: string | WelderVariable[] | TestConducted[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addWelderVariable = () => {
    const newId = (formData.welderVariables.length + 1).toString();
    const newVariable: WelderVariable = {
      id: newId,
      name: "",
      actualValue: "",
      rangeQualified: "",
    };
    handleInputChange("welderVariables", [
      ...formData.welderVariables,
      newVariable,
    ]);
  };

  const removeWelderVariable = (id: string) => {
    handleInputChange(
      "welderVariables",
      formData.welderVariables.filter((variable) => variable.id !== id)
    );
  };

  const revertToOriginal = () => {
    setFormData(JSON.parse(JSON.stringify(originalFormData)));
  };

  const updateWelderVariable = (
    id: string,
    field: keyof WelderVariable,
    value: string
  ) => {
    const updatedVariables = formData.welderVariables.map((variable) =>
      variable.id === id ? { ...variable, [field]: value } : variable
    );
    handleInputChange("welderVariables", updatedVariables);
  };

  const updateTestConducted = (
    id: string,
    field: keyof TestConducted,
    value: string | boolean
  ) => {
    const updatedTests = formData.testsConducted.map((test) =>
      test.id === id ? { ...test, [field]: value } : test
    );
    handleInputChange("testsConducted", updatedTests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map form data to API schema
    const apiData: CreateWelderCertificateData = {
      welder_card_id: formData.welderCardId,
      date_of_test: formData.dateOfTest,
      identification_of_wps_pqr: formData.wpsIdentification,
      qualification_standard: formData.qualificationStandard,
      base_metal_specification: formData.baseMetalSpec,
      joint_type: formData.jointType,
      weld_type: formData.weldType,
      testing_variables_and_qualification_limits: formData.welderVariables.map(
        (variable) => ({
          name: variable.name,
          actual_values: variable.actualValue,
          range_values: variable.rangeQualified,
        })
      ),
      tests: formData.testsConducted.map((test) => ({
        type: test.testType,
        test_performed: test.isReportChecked,
        results: test.results,
        report_no: test.reportNo,
      })),
      law_name: formData.certificationStatement,
      tested_by: formData.testSupervisor,
      witnessed_by: formData.testingWitnessed,
    };

    onSubmit(apiData);
  };

  const handleCancel = () => {
    revertToOriginal();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Certificate Header */}
      <div className="bg-background print:bg-white">
        {/* ATECO Header */}
        <div className="flex justify-between items-start mb-6">
          {/* Left - ATECO Logo and Info */}
          <div className="flex-1">
            <Image
              src="/gripco-logo.webp"
              alt="Gripco"
              width={100}
              height={80}
              className="object-contain h-20 w-auto"
            />
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">
              Welder / Welder operator performance Qualification Record
            </h2>
            {readOnly ? (
              <h3 className="text-lg font-bold">
                {formData.clientName || "CLIENT NAME"}
              </h3>
            ) : (
              <Input
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
                placeholder="Enter client name"
                className="border-0 py-0 h-auto text-center !text-lg font-bold"
              />
            )}
          </div>

          {/* Right - Welder Photo */}
          <div className="flex-1 flex justify-end">
            <div className="w-40 h-24 border-2  overflow-hidden bg-gray-100 dark:bg-sidebar">
              {formData.welderImage ? (
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_BACKEND_URL
                  }${formData.welderImage.replace(/\\/g, "/")}`}
                  alt="Welder"
                  width={128}
                  height={160}
                  className="w-full h-full object-cover"
                  onLoad={onImageLoad}
                />
              ) : (
                <p className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Photo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information Table */}
        <div className="border mb-6">
          {/* Row 1 */}
          <div className="grid grid-cols-4 border-b">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Welder's/Welder Operator's Name
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.welderName}</span>
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between text-sm"
                    >
                      {selectedWelderCardId
                        ? welderCardsData?.results?.find(
                            (card) => card.id === selectedWelderCardId
                          )?.welder_info?.operator_name || "Select welder..."
                        : "Select welder..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search welders..." />
                      <CommandList>
                        <CommandEmpty>No welder found.</CommandEmpty>
                        <CommandGroup>
                          {welderCardsData?.results?.map((card) => (
                            <CommandItem
                              key={card.id}
                              value={`${card.welder_info?.operator_name} ${card.welder_info?.operator_id} ${card.card_no}`}
                              onSelect={() => {
                                setSelectedWelderCardId(
                                  card.id === selectedWelderCardId
                                    ? undefined
                                    : card.id
                                );
                                if (card.id !== selectedWelderCardId) {
                                  // Auto-fill based on selected welder card
                                  handleInputChange(
                                    "welderCardId",
                                    card.id || ""
                                  );
                                  handleInputChange(
                                    "welderIdNo",
                                    card.welder_info?.operator_id || ""
                                  );
                                  handleInputChange(
                                    "welderName",
                                    card.welder_info?.operator_name || ""
                                  );
                                  handleInputChange(
                                    "iqamaId",
                                    card.welder_info?.iqama || ""
                                  );
                                  handleInputChange(
                                    "welderImage",
                                    card.welder_info?.profile_image || null
                                  );
                                  handleInputChange(
                                    "certificateRefNo",
                                    card.card_no || ""
                                  );
                                  handleInputChange(
                                    "clientName",
                                    card.company || ""
                                  );
                                }
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedWelderCardId === card.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {card.welder_info?.operator_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ID: {card.welder_info?.operator_id} | Card:{" "}
                                  {card.card_no}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Welder ID No
            </div>
            <div className="p-1 border-x">
              <span className="text-sm">{formData.welderIdNo}</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 border-b">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Iqama / ID No
            </div>
            <div className="p-1 border-x">
              <span className="text-sm">{formData.iqamaId}</span>
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Certificate Ref No
            </div>
            <div className="p-1 border-x">
              <span className="text-sm">{formData.certificateRefNo}</span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4 border-b ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Date of Test
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.dateOfTest}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.dateOfTest}
                  onChange={(e) =>
                    handleInputChange("dateOfTest", e.target.value)
                  }
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Identification of WPS/PQR
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.wpsIdentification}</span>
              ) : (
                <Input
                  value={formData.wpsIdentification}
                  onChange={(e) =>
                    handleInputChange("wpsIdentification", e.target.value)
                  }
                  placeholder="Enter WPS/PQR identification"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Qualification Standard
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">
                  {formData.qualificationStandard}
                </span>
              ) : (
                <Input
                  value={formData.qualificationStandard}
                  onChange={(e) =>
                    handleInputChange("qualificationStandard", e.target.value)
                  }
                  placeholder="Enter qualification standard"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Base Metal Specification
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.baseMetalSpec}</span>
              ) : (
                <Input
                  value={formData.baseMetalSpec}
                  onChange={(e) =>
                    handleInputChange("baseMetalSpec", e.target.value)
                  }
                  placeholder="Enter base metal specification"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-4 border-t ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Joint Type
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.jointType}</span>
              ) : (
                <Input
                  value={formData.jointType}
                  onChange={(e) =>
                    handleInputChange("jointType", e.target.value)
                  }
                  placeholder="Enter joint type"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Weld Type
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.weldType}</span>
              ) : (
                <Input
                  value={formData.weldType}
                  onChange={(e) =>
                    handleInputChange("weldType", e.target.value)
                  }
                  placeholder="Enter weld type"
                  className="border-0 py-0 h-auto text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Welder Variables Table */}
        <div className="border  mb-6">
          <div className="grid grid-cols-3 border-b  bg-background dark:bg-sidebar">
            <div className="p-1 font-medium text-sm border-r">
              Welder variables
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Actual Values
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Range Qualified
            </div>
          </div>

          {formData.welderVariables.map((variable, index) => (
            <div
              key={variable.id}
              className={`grid grid-cols-3 ${
                index % 2 === 0
                  ? "bg-white dark:bg-background"
                  : "bg-background dark:bg-sidebar"
              }`}
            >
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm">{variable.name}</span>
                ) : (
                  <Input
                    value={variable.name}
                    onChange={(e) =>
                      updateWelderVariable(variable.id, "name", e.target.value)
                    }
                    placeholder="Enter variable name"
                    className="border-0 py-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm">{variable.actualValue}</span>
                ) : (
                  <Input
                    value={variable.actualValue}
                    onChange={(e) =>
                      updateWelderVariable(
                        variable.id,
                        "actualValue",
                        e.target.value
                      )
                    }
                    placeholder="Actual value"
                    className="border-0 py-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-1">
                {readOnly ? (
                  <span className="text-sm">{variable.rangeQualified}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={variable.rangeQualified}
                      onChange={(e) =>
                        updateWelderVariable(
                          variable.id,
                          "rangeQualified",
                          e.target.value
                        )
                      }
                      placeholder="Range qualified"
                      className="border-0 py-0 h-auto text-sm flex-1"
                    />
                    {!readOnly && (
                      <ConfirmPopover
                        trigger={
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="text-xs h-7 w-7"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                        title="Confirm Deletion"
                        description="Are you sure you want to delete this welder variable?"
                        onConfirm={() => removeWelderVariable(variable.id)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!readOnly && (
            <div className="p-1 border-t ">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWelderVariable}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Welder Variable
              </Button>
            </div>
          )}
        </div>

        {/* Test Conducted Table */}
        <div className="border mb-6 text-center">
          <div className="grid grid-cols-4 border-b bg-background dark:bg-sidebar">
            <div className="p-1 font-medium text-sm border-r">
              Test Conducted/ Type of Test
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Test Performed
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Results
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Report No
            </div>
          </div>

          {formData.testsConducted.map((test, index) => (
            <div
              key={test.id}
              className={`grid grid-cols-4 ${
                index % 2 === 0
                  ? "bg-white dark:bg-background"
                  : "bg-background dark:bg-sidebar"
              }`}
            >
              <div className="p-1 border-r ">
                <span className="text-sm">{test.testType}</span>
              </div>
              <div className="p-1 border-r ">
                {readOnly ? (
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={test.isReportChecked}
                      disabled
                      className="w-4 h-4"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={test.isReportChecked}
                      onCheckedChange={(checked) =>
                        updateTestConducted(test.id, "isReportChecked", checked)
                      }
                      className="w-4 h-4"
                    />
                  </div>
                )}
              </div>
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm text-center">
                    {test.isReportChecked ? "N/A" : test.reportNo}
                  </span>
                ) : (
                  <Input
                    value={test.reportNo}
                    onChange={(e) =>
                      updateTestConducted(test.id, "reportNo", e.target.value)
                    }
                    placeholder="Enter report number"
                    className="border-0 py-0 h-auto text-sm flex-1 text-center"
                  />
                )}
              </div>
              <div className="p-1">
                {readOnly ? (
                  <span className="text-sm text-center">{test.results}</span>
                ) : (
                  <Input
                    value={test.results}
                    onChange={(e) =>
                      updateTestConducted(test.id, "results", e.target.value)
                    }
                    placeholder="Enter results"
                    className="border-0 py-0 h-auto text-sm text-center"
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
              We, the undersigned, certify that the statements in the record are
              correct and that the test coupons were welded and tested in
              accordance with the requirements of{" "}
              {readOnly ? (
                <span className="font-bold text-blue-600">
                  {formData.certificationStatement}
                </span>
              ) : (
                <Input
                  value={formData.certificationStatement}
                  onChange={(e) =>
                    handleInputChange("certificationStatement", e.target.value)
                  }
                  placeholder="ASME SEC IX Ed(2023)"
                  className="border-0 py-0 h-auto text-sm inline-block w-48 text-center font-bold text-blue-600 bg-transparent"
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
                <p className="font-semibold mb-2 text-sm">
                  Testing Witnessed / Welder Inspector
                </p>
                <div className="underline text-right">
                  {readOnly ? (
                    <p className="text-sm font-medium">
                      {formData.testingWitnessed}
                    </p>
                  ) : (
                    <Input
                      value={formData.testingWitnessed}
                      onChange={(e) =>
                        handleInputChange("testingWitnessed", e.target.value)
                      }
                      placeholder="Enter inspector name"
                      className="border-0 py-0 h-auto text-sm font-medium text-right"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold mb-2 text-sm">
                  Test Supervisor / Technical Manager
                </p>
                <div className="underline text-right">
                  {readOnly ? (
                    <p className="text-sm font-medium">
                      {formData.testSupervisor}
                    </p>
                  ) : (
                    <Input
                      value={formData.testSupervisor}
                      onChange={(e) =>
                        handleInputChange("testSupervisor", e.target.value)
                      }
                      placeholder="Enter supervisor name"
                      className="border-0 py-0 h-auto text-sm font-medium text-right"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Client Details and QR Code */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm mb-2">Client Name:</p>
              <p className="text-sm font-medium underline">
                {formData.clientName}
              </p>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm mb-2">Client Signature:</p>
              <div className="border-b-2 border-gray-400 pb-1 min-w-32"></div>
            </div>

            {/* QR Code Verification Area */}
            <div className="bg-gray-200 dark:bg-sidebar p-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs">
                    To verify the information about the certificate. Please scan
                    the QR code using any QR scan app
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
          <p>
            Address: 3658 Ar Rabiyah District Unit No:02, P.0 Box 32437 Dammam
            6621 KSA
          </p>
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
            {initialData ? "Update Certificate" : "Create Certificate"}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { WelderQualificationData, WelderVariable, TestConducted };
